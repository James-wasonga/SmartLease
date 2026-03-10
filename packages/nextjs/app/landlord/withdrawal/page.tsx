import { ReactNode, Suspense } from "react"
import WithdrawFundsClientPage from "./_page"

const WithdrawFund = () => {
  return (
    <>
        <Suspense fallback={<div>Loading...</div>}>
          <WithdrawFundsClientPage/>
        </Suspense>
    </>
  )
}

export default WithdrawFund