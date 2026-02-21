import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockActivityData } from "@/data/mockData";

export function ActivityChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Training Activity (7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockActivityData}>
              <defs>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243,75%,59%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(243,75%,59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(220,9%,46%)", fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(220,9%,46%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0,0%,100%)",
                  border: "1px solid hsl(220,13%,91%)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="credits" stroke="hsl(243,75%,59%)" fill="url(#colorCredits)" strokeWidth={2} />
              <Area type="monotone" dataKey="jobs" stroke="hsl(142,71%,45%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
