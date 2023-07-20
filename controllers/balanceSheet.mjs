import { JournalEntryModel, AccountModel, PastJournalEntryModel } from "../models/models.mjs";
import { calculateOwnerEquityStatement } from "./ownerEquityStatement.mjs";

const calculateBalanceSheet = async () => {
    try {
        const accountTypes = ['asset', 'liability', 'owner_capital'];

        // Fetch the account(s) with the specified account types
        const accounts = await AccountModel.findAll({
            where: {
                account_type: accountTypes
            },
            attributes: ['account_id']
        });

        // Extract the account IDs from the accounts
        const accountIds = accounts.map((account) => account.account_id);

        // Fetch all journal entries associated with the extracted account IDs
        const pastJournalEntries = await PastJournalEntryModel.findAll({
            where: {
                account_id: accountIds
            },
            include: [
                {
                    model: AccountModel,
                }
            ]
        });


        // Retrieve all journal entries from the database, including associated account information
        const journalEntries = await JournalEntryModel.findAll({
            include: {
                model: AccountModel,
                required: false, // Perform a left join
            },
        });

        const allEntries = [...pastJournalEntries, ...journalEntries];

        // Initialize variables to store the asset and liability & equity totals
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let transactions = {
            assets: [],
            liabilities: [],
            equity: []
        }

        let account_balance = {};

        // Calculate the asset, liability, and equity totals by iterating through the journal entries
        for (const entry of allEntries) {
            let { Account, amount, transaction_type, entry_type } = entry;

            Account.dataValues.amount = amount
            transaction_type = transaction_type.toLowerCase();


            let { account_type, account_id } = Account;

            account_type = account_type.toLowerCase();

            if (account_type === 'asset') {
                // transactions.assets.push(Account)
                // Asset account
                if (transaction_type === 'debit') {
                    account_balance[account_id] = (account_balance[account_id] || 0) + +amount;
                    totalAssets += +amount;
                } else if (transaction_type === 'credit') {
                    account_balance[account_id] = (account_balance[account_id] || 0) - +amount;
                    totalAssets -= +amount;
                }
            } else if (account_type === 'liability') {
                // transactions.liabilities.push(Account)
                // Liability account
                if (transaction_type === 'credit') {
                    account_balance[account_id] = (account_balance[account_id] || 0) + +amount;
                    totalLiabilities += +amount;
                } else if (transaction_type === 'debit') {
                    account_balance[account_id] = (account_balance[account_id] || 0) - +amount;
                    totalLiabilities -= +amount;
                }
            } else if (account_type === 'owner_capital') {
                transactions.equity.push(Account)
            }

        }

        await Promise.all(
            Object.entries(account_balance).map(async ([accountId, totalAmount]) => {
                const account = await AccountModel.findByPk(accountId);

                const account_id = accountId;
                const account_name = account ? account.account_name : 'Unknown';
                const account_type = account.account_type.toLowerCase();
                const amount = totalAmount;

                if (account_type == 'asset') {
                    transactions['assets'].push({ account_id, account_name, account_type, amount });
                }
                else if (account_type == 'liability') {
                    transactions['liabilities'].push({ account_id, account_name, account_type, amount });
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

        const ownerEquityStatement = await calculateOwnerEquityStatement();
        totalEquity = ownerEquityStatement.newOwnerEquity


        const isBalanced = totalAssets === +totalLiabilities + +totalEquity ? true : false

        // Prepare and return the balance sheet data
        const balanceSheet = {
            transactions,
            assets: totalAssets,
            liabilities: totalLiabilities,
            equity: totalEquity,
            isBalanced
        };

        return balanceSheet;
    } catch (error) {
        console.error("Error generating balance sheet:", error);
        throw new Error("Failed to generate balance sheet");
    }
};

export const generateBalanceSheet = async (req, res) => {
    try {
        const balanceSheet = await calculateBalanceSheet();

        res.status(200).json(balanceSheet);
    } catch (error) {
        console.error("Error generating balance sheet:", error);
        res.status(500).json({ error: "Failed to generate balance sheet" });
    }
};
