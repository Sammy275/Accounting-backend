import { JournalEntryModel, AccountModel } from "../models/models.mjs";

export const getTrialBalance = async (req, res) => {
  try {
    // Retrieve all journal entries from the database, including associated account information
    const journalEntries = await JournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false, // Perform a left join
      },
    });

    // Initialize an object to store the account balances
    const accountBalances = {};

    // Calculate the account balances by iterating through the journal entries
    for (const entry of journalEntries) {
      const { Account, amount, entry_type } = entry;

      if (Account && entry_type !== 'closing') {
        const { account_id } = Account;
        const transactionType = entry.transaction_type.toLowerCase();

        // Add or subtract the amount based on the transaction type (credit or debit)
        if (transactionType === 'credit') {
          accountBalances[account_id] = (accountBalances[account_id] || 0) - +amount;
        } else if (transactionType === 'debit') {
          accountBalances[account_id] = (accountBalances[account_id] || 0) + +amount;
        }
      }
    }

    let trialBalance = {}

    let transactions = {
      credit: 0,
      debit: 0
    };

    // Prepare the trial balance report data with both account name and ID
    const trialBalanceEntries = await Promise.all(
      Object.entries(accountBalances).map(async ([accountId, balance]) => {
        const account = await AccountModel.findByPk(accountId);
     
        const account_name = account ? account.account_name : 'Unknown';
        const account_type = account.account_type.toLowerCase();
        let isDebit = false;

        if(account_type === 'asset' || account_type === 'expense' || account_type === 'owner_drawings'){
            transactions.debit += +balance
            isDebit = true
          }
          else {
            balance = balance * -1
            transactions.credit += +balance
        }

        return { account_id: accountId, account_name, balance, account_type, is_debit: isDebit};
      })
    );

      trialBalance.trialBalanceEntries = trialBalanceEntries
      trialBalance.transactions = transactions
    res.status(200).json(trialBalance);
  } catch (error) {
    console.error("Error generating trial balance report:", error);
    res.status(500).json({ error: "Failed to generate trial balance report" });
  }
};
