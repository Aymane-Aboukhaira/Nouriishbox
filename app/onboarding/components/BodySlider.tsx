"use client";

interface BodySliderProps {
    label: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (val: number) => void;
}

export function BodySlider({ label, unit, value, min, max, step = 1, onChange }: BodySliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full bg-white p-8 rounded-[20px] border-[1.5px] border-border shadow-[0_4px_20px_rgba(44,62,45,0.02)]">
            <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-text-muted uppercase tracking-[0.15em] font-sans">{label}</span>
                <div className="flex items-baseline gap-1.5 ">
                    <input 
                        type="number"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 0 && val <= max) {
                                onChange(val);
                            }
                        }}
                        onBlur={(e) => {
                            let val = Number(e.target.value);
                            if (val < min) val = min;
                            if (val > max) val = max;
                            onChange(val);
                        }}
                        className="w-24 text-5xl font-serif text-text-primary leading-none bg-transparent border-none focus:outline-none focus:ring-0 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider font-sans">{unit}</span>
                </div>
            </div>
            
            <div className="relative h-12 flex items-center group">
                {/* Track Background */}
                <div className="absolute w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary/20 transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                
                {/* Active Track */}
                <div 
                    className="absolute h-1.5 bg-primary rounded-full transition-all duration-300 ease-out left-0"
                    style={{ width: `${percentage}%` }}
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Custom Thumb */}
                <div 
                    className="absolute w-10 h-10 bg-white border-[1.5px] border-primary rounded-full shadow-lg pointer-events-none transition-all duration-300 ease-out transform -translate-x-1/2 flex items-center justify-center group-active:scale-110"
                    style={{ left: `${percentage}%` }}
                >
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-40" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-4 text-[10px] text-text-muted/50 font-bold uppercase tracking-widest font-sans">
                <span>{min} {unit}</span>
                <span>{max} {unit}</span>
            </div>
        </div>
    );
}
