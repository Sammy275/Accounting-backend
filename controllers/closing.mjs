import { AccountModel, TransactionModel, JournalEntryModel, PastJournalEntryModel } from "../models/models.mjs";

export const closeJournalEntries = async (req, res) => {
  try {
    const owneEquityAccount = await AccountModel.findOne({
      where: {
        account_type: 'owner_capital'
      }
    });

    console.log(owneEquityAccount.account_id);

    // Retrieve all journal entries from JournalEntryModel
    let journalEntries = await JournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false,
      },
    });

    if (journalEntries.length === 0) {
      // No journal entries found
      res.status(200).json({ message: 'No journal entries found' });
      return;
    }

    for (const entry of journalEntries) {
      if (entry.Account.account_type === 'expense' || entry.Account.account_type === 'owner_drawings') {
        const transaction = await TransactionModel.create({
          transaction_date: new Date(),
          description: "Closing transaction"
        });

        // Create journal entries for the credit and debit
        const creditEntry = await JournalEntryModel.create({
          transaction_id: transaction.transaction_id,
          account_id: entry.account_id,
          transaction_type: "credit",
          amount: entry.amount,
          entry_type: 'closing'
        });

        const debitEntry = await JournalEntryModel.create({
          transaction_id: transaction.transaction_id,
          account_id: owneEquityAccount.account_id,
          transaction_type: "debit",
          amount: entry.amount,
          entry_type: 'closing'
        });
      }

      else if (entry.Account.account_type === 'revenue') {
        const transaction = await TransactionModel.create({
          transaction_date: new Date(),
          description: "Closing transaction"
        });

        // Create journal entries for the credit and debit
        const creditEntry = await JournalEntryModel.create({
          transaction_id: transaction.transaction_id,
          account_id: owneEquityAccount.account_id,
          transaction_type: "credit",
          amount: entry.amount,
          entry_type: 'closing'
        });

        const debitEntry = await JournalEntryModel.create({
          transaction_id: transaction.transaction_id,
          account_id: entry.account_id,
          transaction_type: "debit",
          amount: entry.amount,
          entry_type: 'closing'
        });
      }
    }


    let closing_account_id_set = new Set();
    for (const entry of journalEntries) {
      const { Account } = entry;
      const { account_id, account_type } = Account;


      if (account_type === 'revenue' || account_type === 'expense' || account_type === 'owner_drawings') {
        closing_account_id_set.add(account_id);
      }

    }

    for (const account_id of closing_account_id_set) {
      await AccountModel.update(
        { account_status: false },
        { where: { account_id: account_id } }
      );
    }


    journalEntries = await JournalEntryModel.findAll({
      include: {
        model: AccountModel,
        required: false,
      },
    });

    // Prepare the journal entry records for insertion into PastJournalEntryModel
    const pastJournalEntries = journalEntries.map(entry => ({
      transaction_date: entry.transaction_date,
      description: entry.description,
      transaction_type: entry.transaction_type,
      transaction_id: entry.transaction_id,
      account_id: entry.account_id,
      amount: entry.amount,
      entry_type: entry.entry_type,
    }));

    // Create journal entry history records in PastJournalEntryModel
    await PastJournalEntryModel.bulkCreate(pastJournalEntries);

    // Delete all journal entries from JournalEntryModel
    await JournalEntryModel.destroy({
      truncate: true,
      where: {},
    });

    res.status(200).json({ message: 'Journal entries closed successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};
