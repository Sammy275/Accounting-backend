import { TransactionModel, JournalEntryModel, PastJournalEntryModel, AccountModel } from "../models/models.mjs";


export const createJournalTransaction = async (req, res) => {
  const { description, amount, credit, debit } = req.body;

  try {
    // Create a new transaction
    const transaction = await TransactionModel.create({
      transaction_date: new Date(),
      description
    });

    // Create journal entries for the credit and debit
    const creditEntry = await JournalEntryModel.create({
      transaction_id: transaction.transaction_id,
      account_id: credit.account_id,
      transaction_type: "credit",
      amount,
      entry_type: credit.entry_type
    });

    const debitEntry = await JournalEntryModel.create({
      transaction_id: transaction.transaction_id,
      account_id: debit.account_id,
      transaction_type: "debit",
      amount,
      entry_type: debit.entry_type
    });

    // Return the newly created transaction and entries
    res.status(200).json({ message: "Journal entries created successfully" });
  } catch (error) {
    // Handle any errors that occur during the creation
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the journal transaction.' });
  }
}

export const getAllJournalEntries = async (req, res) => {
  try {
    // Fetch all journal entries including the associated transaction
    const journalEntries = await JournalEntryModel.findAll({
      include: [
        {
          model: TransactionModel,
        },
        {
          model: AccountModel,
        }
      ]
    });

    const pastJournalEntries = await PastJournalEntryModel.findAll({
      include: [
        {
          model: TransactionModel,
        },
        {
          model: AccountModel,
        }
      ]
    });

    // Group the journal entries and past journal entries by transaction ID
    const entriesByTransaction = {};

    // Function to group entries by transaction
    const groupEntries = (entry) => {
      const transactionId = entry.Transaction.transaction_id;
      const transactionDate = entry.Transaction.transaction_date;

      if (!entriesByTransaction[transactionId]) {
        entriesByTransaction[transactionId] = {
          transaction_id: transactionId,
          transaction_date: transactionDate,
          entries: []
        };
      }

      entriesByTransaction[transactionId].entries.push(entry);
    };

    // Group the Journal Entry rows
    journalEntries.forEach(groupEntries);

    // Group the Past Journal Entry rows
    pastJournalEntries.forEach(groupEntries);

    // Convert the grouped entries object to an array
    const result = Object.values(entriesByTransaction);

    res.json(result);
  } catch (error) {
    // Handle any errors that occur during the retrieval
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the journal entries.' });
  }
};


export const getCurrentJournalEntries = async (req, res) => {
  try {
    // Fetch all journal entries including the associated transaction
    const journalEntries = await JournalEntryModel.findAll({
      include: [
        {
          model: TransactionModel,
        },
        {
          model: AccountModel,
        }
      ]
    });

    // Group the journal entries by transaction ID
    const journalEntriesByTransaction = journalEntries.reduce((result, entry) => {
      const transactionId = entry.Transaction.transaction_id;
      const transactionDate = entry.Transaction.transaction_date;

      if (!result[transactionId]) {
        result[transactionId] = {
          transaction_id: transactionId,
          transaction_date: transactionDate,
          entries: []
        };
      }

      result[transactionId].entries.push(entry);

      return result;
    }, {});

    // Convert the grouped entries object to an array
    const result = Object.values(journalEntriesByTransaction);

    res.json(result);
  } catch (error) {
    // Handle any errors that occur during the retrieval
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the journal entries.' });
  }
};


// This controller returns all of the journal entries of a specific account
// This controller returns transaction from Current and Past Journal
export const getAllEntriesByAccount = async (req, res) => {
  const { account_id } = req.body;

  try {
    // Fetch journal entries from Current Journal Entries
    const currentJournalEntries = await JournalEntryModel.findAll({
      where: {
        account_id: account_id
      },
      include: [
        {
          model: AccountModel,
        }
      ]
    });

    // Fetch journal entries from Past Journal Entries
    const pastJournalEntries = await PastJournalEntryModel.findAll({
      where: {
        account_id: account_id
      },
      include: [
        {
          model: AccountModel,
        }
      ]
    });

    // Combine the journal entries from both tables
    const journalEntries = [...pastJournalEntries, ...currentJournalEntries, ];

    res.json(journalEntries);
  } catch (error) {
    // Handle any errors that occur during the retrieval
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the journal entries.' });
  }
}