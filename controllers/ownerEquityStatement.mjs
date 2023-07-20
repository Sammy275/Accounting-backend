import { JournalEntryModel, AccountModel, PastJournalEntryModel } from "../models/models.mjs";

export const calculateOwnerEquityStatement = async () => {
  try {

    const ownerEquityAccount = await AccountModel.findOne({
      where: {
        account_type: 'owner_capital'
      }
    });

    const pastOwnerEquityEntries = await PastJournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false, // Perform a left join
      },
      where: {
        account_id: ownerEquityAccount.account_id
      }
    });

    // Retrieve all journal entries from the database, including associated account information
    const journalEntries = await JournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false, // Perform a left join
      },
    });


    const allEntries = [...journalEntries, ...pastOwnerEquityEntries];

    // Initialize variables to store the net income and owner's equity total
    let netIncome = 0;
    let ownerEquity = 0;
    let ownerWithdrawals = 0;
    let ownerTransactions = {
      withdrawals: [],
      deposits: []
    }

    // Calculate the net income and owner's equity by iterating through the journal entries
    for (const entry of allEntries) {
      let { Account, amount, transaction_type, entry_type } = entry;

      transaction_type = transaction_type.toLowerCase()


      let { account_type } = Account;

      Account.dataValues.amount = amount

      account_type = account_type.toLowerCase()

      if (account_type === 'revenue') {
        // Revenue account
        if (transaction_type === 'credit') {
          netIncome += +amount;
        } else if (transaction_type === 'debit') {
          netIncome -= +amount;
        }
      } else if (account_type === 'expense') {
        // Expense account
        if (transaction_type === 'debit') {
          netIncome -= +amount;
        } else if (transaction_type === 'credit') {
          netIncome += +amount;
        }
      } // else if (account_type === 'owner_capital' || account_type === 'owner_drawings') {
      //   // Owner's capital or owner's drawings account
      //   if (transaction_type === 'debit') {
      //     ownerTransactions.withdrawals.push(Account)
      //     ownerWithdrawals += +amount;
      //   } else if (transaction_type === 'credit') {
      //     ownerTransactions.deposits.push(Account)
      //     ownerEquity += +amount;
      //   }
      // }
      else if (account_type === 'owner_capital' && transaction_type === 'debit') {
        ownerTransactions.deposits.push(Account)
        ownerEquity -= +amount;
      }
      else if (account_type === 'owner_capital' && transaction_type === 'credit') {
        ownerTransactions.deposits.push(Account)
        ownerEquity += +amount;
      }
      else if (account_type === 'owner_drawings') {
        ownerTransactions.withdrawals.push(Account)
        ownerWithdrawals += +amount;
      }

    }

    // Add net income to the owner's equity
    // ownerEquity += netIncome;
    let newOwnerEquity = (ownerEquity + netIncome) - ownerWithdrawals;

    // Prepare and return the owner's equity statement data
    const ownerEquityStatement = {
      ownerTransactions,
      ownerEquity,
      netIncome,
      ownerWithdrawals,
      newOwnerEquity
    };

    return ownerEquityStatement;
  } catch (error) {
    console.error("Error generating owner's equity statement:", error);
    throw new Error("Failed to generate owner's equity statement");
  }
};

export const generateOwnerEquityStatement = async (req, res) => {
  try {
    const ownerEquityStatement = await calculateOwnerEquityStatement();

    res.status(200).json(ownerEquityStatement);
  } catch (error) {
    console.error("Error generating owner's equity statement:", error);
    res.status(500).json({ error: "Failed to generate owner's equity statement" });
  }
};
