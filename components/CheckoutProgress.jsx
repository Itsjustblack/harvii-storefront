const STEPS = ['Contact & Address', 'Review Order', 'Payment']

export default function CheckoutProgress({ currentStep }) {
    return (
        <div className="flex items-center justify-center mb-10">
            {STEPS.map((label, i) => {
                const stepNum = i + 1
                const isDone = stepNum < currentStep
                const isActive = stepNum === currentStep

                return (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`size-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                    isDone
                                        ? 'bg-green-500 text-white'
                                        : isActive
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {isDone ? '✓' : stepNum}
                            </div>
                            <p
                                className={`text-xs mt-1.5 whitespace-nowrap font-medium ${
                                    isActive ? 'text-[var(--primary)]' : isDone ? 'text-green-500' : 'text-slate-400'
                                }`}
                            >
                                {label}
                            </p>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 transition-all ${
                                    isDone ? 'bg-green-400' : 'bg-slate-200'
                                }`}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}