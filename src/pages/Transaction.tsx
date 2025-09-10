import TransactionsTable from "../components/TransactionTable"
export default function Transaction() {
    return (
        <div>
        <h1 className="text-2xl font-bold mb-6 text-blue-400 dark:text-blue-300">
            Transactions
        </h1>
            <TransactionsTable />
        </div>
    )
}