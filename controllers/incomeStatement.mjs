import { JournalEntryModel, AccountModel } from "../models/models.mjs";

export const generateIncomeStatement = async (req, res) => {
  try {
    // Retrieve all journal entries from the database, including associated account information
    const journalEntries = await JournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false, // Perform a left join
      },
    });

    // Initialize variables to store the revenue, expense, and net income totals
    let totalRevenue = 0;
    let totalExpenses = 0;
    let netIncome = 0;

    let entities = {
      revenue: [],
      expense: []
    }

    let account_balance = {};

    // Calculate the revenue and expense totals by iterating through the journal entries
    for (const entry of journalEntries) {
      const { Account, amount, entry_type } = entry;

      if (Account && entry_type !== 'closing') {
        const { account_type, account_id } = Account;
        Account.dataValues.amount = amount

        if (account_type === 'revenue') {
          account_balance[account_id] = (account_balance[account_id] || 0) + +amount;
          // entities.revenue.push(Account)
          // Revenue account
          totalRevenue += +amount;
        } else if (account_type === 'expense') {
          account_balance[account_id] = (account_balance[account_id] || 0) + +amount;
          // entities.expense.push(Account)
          // Expense account
          totalExpenses += +amount;
        }
      }
    }


    await Promise.all(
      Object.entries(account_balance).map(async ([accountId, balance]) => {
        const account = await AccountModel.findByPk(accountId);
        
        const account_id = accountId;
        const account_name = account ? account.account_name : 'Unknown';
        const account_type = account.account_type.toLowerCase();
        const amount = balance;

        if (account_type == 'revenue') {
          entities['revenue'].push({ account_id, account_name, account_type, amount});
        }
        else {
          entities['expense'].push({ account_id, account_name, account_type, amount});
        }
        
        // let isDebit = false;

        // if(account_type === 'asset' || account_type === 'expense' || account_type === 'owner_drawings'){
        //     // transactions.debit += +balance
        //     isDebit = true
        //   }
        //   else {
        //     balance = balance * -1
        //     // transactions.credit += +balance
        // }

        // return { account_id: accountId, account_name, balance, account_type, is_debit: isDebit};
      })
    );

    // Calculate the net income by subtracting the total expenses from the total revenue
    netIncome = totalRevenue - totalExpenses;

    // Retrieve the net income from the "owner_capital" account
    const ownerCapitalAccount = await AccountModel.findOne({
      where: { account_type: 'owner_capital' },
    });

    if (ownerCapitalAccount) {
      const { account_name, account_id } = ownerCapitalAccount;
      const ownerCapitalEntry = await JournalEntryModel.findOne({
        where: { account_id },
      });

      if (ownerCapitalEntry) {
        const { amount, entry_type } = ownerCapitalEntry;

        // Add or subtract the amount based on the entry type (debit or credit)
        if (entry_type === 'debit') {
          netIncome -= +amount;
        } else if (entry_type === 'credit') {
          netIncome += +amount;
        }
      }
    }

    // Prepare the income statement data
    const incomeStatement = {
      entities,
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome
    };

    res.status(200).json(incomeStatement);
  } catch (error) {
    console.error("Error generating income statement:", error);
    res.status(500).json({ error: "Failed to generate income statement" });
  }
};
