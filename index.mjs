import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize from './config/config.mjs'
import accountRoutes from './routes/accounts.mjs'
import journalEntryRoutes from './routes/journalEntries.mjs'
import trialBalanceRoutes from './routes/trialBalance.mjs'
import incomeStatementRoutes from './routes/incomeStatement.mjs'
import ownerEquityStatementRoutes from './routes/ownerEquityStatement.mjs'
import balanceSheetRoutes from './routes/balanceSheet.mjs'
import closingRoutes from './routes/closing.mjs'

const app = express()
app.use(express.json());

app.use(
    cors({
        origin: 'http://127.0.0.1:5173',
        methods: ['GET', 'POST', 'DELETE'],
        credentials: true,
    })
);
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/accounts', accountRoutes)
app.use('/journalEntry', journalEntryRoutes)
app.use('/trialBalance', trialBalanceRoutes)
app.use('/generateIncomeStatement', incomeStatementRoutes)
app.use('/generateOwnerEquityStatement', ownerEquityStatementRoutes)
app.use('/generateBalanceSheet', balanceSheetRoutes)
app.use('/closing', closingRoutes)


sequelize.sync().then(() => {
    app.listen(3001, () => {
        console.log('Server Running on port ' + 3001);
    });
})