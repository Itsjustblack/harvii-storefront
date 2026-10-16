const STEPS = [
    { full: 'Contact & Address', short: 'Details' },
    { full: 'Review Order', short: 'Review' },
    { full: 'Payment', short: 'Payment' },
]

// Fluid on every width: circles with flexible connector lines between them, and
// labels that shorten on phones instead of overflowing the screen.
export default function CheckoutProgress({ currentStep }) {
    return (
        <ol className="mb-8 flex w-full items-start sm:mb-10" aria-label="Checkout progress">
            {STEPS.map((step, i) => {
                const stepNum = i + 1
                const isDone = stepNum < currentStep
                const isActive = stepNum === currentStep
                const last = i === STEPS.length - 1

                return (
                    <li
                        key={step.full}
                        className={`flex items-start ${last ? 'shrink-0' : 'min-w-0 flex-1'}`}
                        aria-current={isActive ? 'step' : undefined}
                    >
                        <div className="flex w-16 shrink-0 flex-col items-center sm:w-28">
                            <div
                                className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
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
                                className={`mt-1.5 text-center text-[11px] font-medium leading-tight sm:text-xs ${
                                    isActive ? 'text-[var(--primary)]' : isDone ? 'text-green-600' : 'text-slate-400'
                                }`}
                            >
                                <span className="sm:hidden">{step.short}</span>
                                <span className="hidden sm:inline">{step.full}</span>
                            </p>
                        </div>
                        {!last && (
                            <div
                                className={`mt-[17px] h-0.5 min-w-4 flex-1 transition-all ${
                                    isDone ? 'bg-green-400' : 'bg-slate-200'
                                }`}
                            />
                        )}
                    </li>
                )
            })}
        </ol>
    )
}
