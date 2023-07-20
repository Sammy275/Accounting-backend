import { Sequelize } from "sequelize";
import { AccountModel } from "../models/models.mjs"

export const createAccount = async (req, res) => {
    const { accountName, accountType } = req.body
    try {
        await AccountModel.create({
            account_name: accountName,
            account_type: accountType,
            account_status: true,
        })
        res.status(201).json({ message: 'Account Created Successfully' });
    } catch (error) {
        res.status(500).json(error.message);
    }
}

export const getAccounts = async (req, res) => {
    try {
        const accounts = await AccountModel.findAll();

        accounts.sort((prevAccount, nextAccount) => {
            if (prevAccount.account_type < nextAccount.account_type)
                return -1;
            return 1;
        });

        res.status(200).json(accounts)
    } catch (error) {
        res.status(500).json(error.message)
    }
}

export const getActiveAccounts = async (req, res) => {
    try {
        const accounts = await AccountModel.findAll({
            where: {
                account_status: {
                    [Sequelize.Op.notIn]: [false],
                }
            }
        })
        accounts.sort((prevAccount, nextAccount) => {
            if (prevAccount.account_type < nextAccount.account_type)
                return -1;
            return 1;
        });

        res.status(200).json(accounts)
    } catch (error) {
        res.status(500).json(error.message)
    }
}