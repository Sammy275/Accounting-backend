import { Sequelize } from 'sequelize';
import sequelize from '../config/config.mjs';

const { DataTypes } = Sequelize;

export const TransactionModel = sequelize.define('Transactions', {
  transaction_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// JournalEntry model
export const JournalEntryModel = sequelize.define('JournalEntries', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  entry_type: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// PastJournalEntry model
export const PastJournalEntryModel = sequelize.define('PastJournalEntries', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  entry_type: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Account model
export const AccountModel = sequelize.define('Accounts', {
  account_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define relationships
TransactionModel.hasMany(JournalEntryModel, { foreignKey: 'transaction_id' });
JournalEntryModel.belongsTo(TransactionModel, { foreignKey: 'transaction_id' });

TransactionModel.hasMany(PastJournalEntryModel, { foreignKey: 'transaction_id' });
PastJournalEntryModel.belongsTo(TransactionModel, { foreignKey: 'transaction_id' });

AccountModel.hasMany(JournalEntryModel, { foreignKey: 'account_id' });
JournalEntryModel.belongsTo(AccountModel, { foreignKey: 'account_id' });

AccountModel.hasMany(PastJournalEntryModel, { foreignKey: 'account_id' });
PastJournalEntryModel.belongsTo(AccountModel, { foreignKey: 'account_id' });


(async () => {
  const queryInterface = sequelize.getQueryInterface();
  const tableNames = await queryInterface.showAllTables();

  for (const tableName of tableNames) {
    const foreignKeyConstraints = await queryInterface.getForeignKeyReferencesForTable(tableName);

    for (const constraint of foreignKeyConstraints) {
      const { constraintName } = constraint;
      await queryInterface.removeConstraint(tableName, constraintName);
    }
  }

})();