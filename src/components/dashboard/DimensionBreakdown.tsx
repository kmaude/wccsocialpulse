import { Progress } from "@/components/ui/progress";
import { type ScoreDimension, getScoreColor } from "@/data/mockScoreData";

interface Props {
  dimensions: ScoreDimension[];
}

export function DimensionBreakdown({ dimensions }: Props) {
  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div key={dim.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{dim.name}</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{dim.weight}%</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: getScoreColor(dim.score) }}>
              {dim.score}
            </span>
          </div>
          <div className="relative">
            <Progress value={dim.score} className="h-2" />
            <div
              className="absolute top-0 left-0 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${dim.score}%`,
                backgroundColor: getScoreColor(dim.score),
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{dim.description}</p>
        </div>
      ))}
    </div>
  );
}
