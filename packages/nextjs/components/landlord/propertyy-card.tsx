type LandlordDashboardCardProps = {
    title: string,
    amount: number,
    currency?: string,
    extraText?: string
}

const LandlordDashboardCard = ({amount, currency, title, extraText}: LandlordDashboardCardProps) => {
    return (
        <>
            <div className="rounded-lg p-8 bg-white shadow-sm">
                <p className="text-slate-800 font-medium text-2xl">{title}</p>
                <div className="flex items-center space-x-1 mt-6">
                    <p className="text-slate-800 font-semibold text-xl">{currency}{amount}</p>
                    <p className="text-base text-slate-700">{extraText}</p>
                </div>
            </div>
        </>
    )
}

export default LandlordDashboardCard