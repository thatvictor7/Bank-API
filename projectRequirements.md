## Bank Account
Accounts
ID: (You Choose) A unique id that represents the account. Created automatically.
Name: (String) Name of the account. Required.
Bank Name: (String) Name of the bank the account is associated with. Required.
Description: (String) A description of the account. Required.
Transactions: (Array) An array of transactions.
Transactions
ID: (You Choose) A unique id that represents the transaction. Created automatically.
Title: (String) A title for the transaction. Cannot be more than 8 characters. Required.
Amount: (Number) A positive or negative number depending on the type of transaction. Required.
Pending: (Boolean) A true/false value for whether or not the transaction is pending. Required. Defaults to true.
Build RESTful routes so that you can:

Create, Read, Update, and Delete accounts
Create, Read, Update, and Delete transactions through accounts