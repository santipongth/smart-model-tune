import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Key, Copy, Eye, EyeOff, Plus, Trash2, Bell, User, CreditCard,
  Check, Shield, Clock, Code, ChevronRight, Zap, AlertTriangle, Users, Mail, MoreHorizontal, Crown, UserCheck, EyeIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageTransition, FadeIn } from "@/components/motion";

// --- API Keys Tab ---
interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
}

const mockApiKeys: ApiKey[] = [
  { id: "1", name: "Production", key: "sk-slm-prod-a8f3...x9k2", created: "2024-01-15", lastUsed: "2 hours ago", status: "active" },
  { id: "2", name: "Development", key: "sk-slm-dev-b2c7...m4p1", created: "2024-02-20", lastUsed: "5 min ago", status: "active" },
  { id: "3", name: "Staging (old)", key: "sk-slm-stg-z1d9...q7w3", created: "2023-11-01", lastUsed: "30 days ago", status: "revoked" },
];

const codeExamples = {
  python: `import openai

client = openai.OpenAI(
    api_key="sk-slm-prod-a8f3...x9k2",
    base_url="https://api.slmstudio.ai/v1"
)

response = client.chat.completions.create(
    model="thai-ner-v2",
    messages=[{"role": "user", "content": "วิเคราะห์: บริษัท ปตท. จำกัด"}],
    temperature=0.1
)
print(response.choices[0].message.content)`,
  curl: `curl -X POST https://api.slmstudio.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-slm-prod-a8f3...x9k2" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "thai-ner-v2",
    "messages": [{"role": "user", "content": "วิเคราะห์: บริษัท ปตท. จำกัด"}],
    "temperature": 0.1
  }'`,
  javascript: `const response = await fetch("https://api.slmstudio.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk-slm-prod-a8f3...x9k2",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "thai-ner-v2",
    messages: [{ role: "user", content: "วิเคราะห์: บริษัท ปตท. จำกัด" }],
    temperature: 0.1,
  }),
});
const data = await response.json();
console.log(data.choices[0].message.content);`,
};

function ApiKeysTab() {
  const [keys, setKeys] = useState(mockApiKeys);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [codeLang, setCodeLang] = useState<"python" | "curl" | "javascript">("python");
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk-slm-${newKeyName.toLowerCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "active",
    };
    setKeys([newKey, ...keys]);
    setNewKeyName("");
    toast({ title: "API key created", description: `Key "${newKeyName}" has been generated.` });
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k)));
    toast({ title: "API key revoked", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Create Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Create New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g. Production)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              className="max-w-xs"
            />
            <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
              Generate Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your API Keys</CardTitle>
          <CardDescription>Manage your API keys for accessing SLM Studio endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{k.name}</span>
                      <Badge variant={k.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {k.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-muted-foreground font-mono">
                        {showKey[k.id] ? k.key.replace("...", "abcdef1234") : k.key}
                      </code>
                      <button onClick={() => setShowKey({ ...showKey, [k.id]: !showKey[k.id] })} className="text-muted-foreground hover:text-foreground">
                        {showKey[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button onClick={() => handleCopy(k.key)} className="text-muted-foreground hover:text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Created {k.created} · Last used {k.lastUsed}
                    </p>
                  </div>
                </div>
                {k.status === "active" && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(k.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Quick Start
          </CardTitle>
          <CardDescription>Use your API key with any OpenAI-compatible SDK</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 mb-3">
            {(["python", "curl", "javascript"] as const).map((lang) => (
              <Button key={lang} variant={codeLang === lang ? "default" : "outline"} size="sm" onClick={() => setCodeLang(lang)} className="text-xs capitalize">
                {lang}
              </Button>
            ))}
          </div>
          <div className="relative">
            <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto border border-border">
              <code>{codeExamples[codeLang]}</code>
            </pre>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(codeExamples[codeLang])}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Notifications Tab ---
function NotificationsTab() {
  const [settings, setSettings] = useState({
    trainingComplete: true,
    trainingFailed: true,
    weeklyReport: false,
    creditLow: true,
    modelDeployed: true,
    emailDigest: false,
    slackIntegration: false,
  });

  const toggle = (key: keyof typeof settings) => setSettings({ ...settings, [key]: !settings[key] });

  const notifItems = [
    { key: "trainingComplete" as const, icon: Check, title: "Training Complete", desc: "Get notified when a training job finishes successfully" },
    { key: "trainingFailed" as const, icon: AlertTriangle, title: "Training Failed", desc: "Alert when a training job encounters an error" },
    { key: "creditLow" as const, icon: Zap, title: "Low Credits Warning", desc: "Notify when credits drop below 20%" },
    { key: "modelDeployed" as const, icon: Shield, title: "Model Deployed", desc: "Confirmation when a model is deployed to production" },
    { key: "weeklyReport" as const, icon: Clock, title: "Weekly Usage Report", desc: "Receive a summary of usage and costs every Monday" },
    { key: "emailDigest" as const, icon: Bell, title: "Email Digest", desc: "Daily digest of all notifications via email" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>Choose what notifications you'd like to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {notifItems.map((item, i) => (
            <div key={item.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
              {i < notifItems.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">S</div>
              <div>
                <p className="text-sm font-medium">Slack</p>
                <p className="text-xs text-muted-foreground">Send notifications to a Slack channel</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Connect</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Account Tab ---
function AccountTab() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "Somchai Dev",
    email: "somchai@example.com",
    org: "AI Labs Thailand",
    role: "Admin",
    timezone: "Asia/Bangkok",
  });

  const handleSave = () => {
    toast({ title: "Profile updated", description: "Your account settings have been saved." });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Organization</Label>
              <Input value={profile.org} onChange={(e) => setProfile({ ...profile, org: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={profile.timezone} onValueChange={(v) => setProfile({ ...profile, timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                  <SelectItem value="US/Pacific">US/Pacific (GMT-8)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Billing Tab ---
const plans = [
  { name: "Free", price: "$0", period: "/mo", features: ["3 training jobs/mo", "2 models", "Community support", "1,000 API calls"], current: false },
  { name: "Pro", price: "$49", period: "/mo", features: ["Unlimited training", "20 models", "Priority support", "100K API calls", "A/B testing"], current: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Pro", "Unlimited models", "Dedicated support", "SLA guarantee", "On-premise option", "SSO"], current: false },
];

const invoices = [
  { date: "Feb 1, 2024", amount: "$49.00", status: "Paid", id: "INV-2024-002" },
  { date: "Jan 1, 2024", amount: "$49.00", status: "Paid", id: "INV-2024-001" },
  { date: "Dec 1, 2023", amount: "$0.00", status: "Free", id: "INV-2023-012" },
];

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border p-4 ${plan.current ? "border-primary bg-accent/50 ring-1 ring-primary" : "border-border"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.current && <Badge>Current</Badge>}
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.current ? "outline" : "default"} size="sm" className="w-full" disabled={plan.current}>
                  {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Training Jobs", used: 8, total: "∞" },
              { label: "Models", used: 5, total: 20 },
              { label: "API Calls", used: 42350, total: 100000 },
              { label: "Storage", used: 2.4, total: 10, unit: "GB" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-lg font-bold">
                  {typeof item.used === "number" && item.used > 999
                    ? `${(item.used / 1000).toFixed(1)}K`
                    : item.used}
                  {item.unit && item.unit}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  of {typeof item.total === "number" && item.total > 999 ? `${(item.total / 1000).toFixed(0)}K` : item.total}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{inv.id}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{inv.amount}</span>
                  <Badge variant={inv.status === "Paid" ? "default" : "secondary"} className="text-[10px]">{inv.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Team Tab ---
type TeamRole = "admin" | "member" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar: string;
  joinedAt: string;
  lastActive: string;
  status: "active" | "pending";
}

const mockTeam: TeamMember[] = [
  { id: "1", name: "Somchai Dev", email: "somchai@example.com", role: "admin", avatar: "SD", joinedAt: "2023-06-01", lastActive: "Just now", status: "active" },
  { id: "2", name: "Ploy Analyst", email: "ploy@example.com", role: "member", avatar: "PA", joinedAt: "2023-09-15", lastActive: "2 hours ago", status: "active" },
  { id: "3", name: "Krit Engineer", email: "krit@example.com", role: "member", avatar: "KE", joinedAt: "2024-01-10", lastActive: "Yesterday", status: "active" },
  { id: "4", name: "Nong Intern", email: "nong@example.com", role: "viewer", avatar: "NI", joinedAt: "2024-02-01", lastActive: "3 days ago", status: "active" },
  { id: "5", name: "New Invite", email: "new@example.com", role: "member", avatar: "NI", joinedAt: "2024-02-18", lastActive: "—", status: "pending" },
];

const roleConfig: Record<TeamRole, { label: string; icon: typeof Crown; color: string; description: string }> = {
  admin: { label: "Admin", icon: Crown, color: "text-warning", description: "Full access · Manage team, billing, and all projects" },
  member: { label: "Member", icon: UserCheck, color: "text-primary", description: "Create & edit projects · Train & deploy models" },
  viewer: { label: "Viewer", icon: EyeIcon, color: "text-muted-foreground", description: "View-only access · Cannot modify projects or models" },
};

function TeamTab() {
  const [members, setMembers] = useState(mockTeam);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const { toast } = useToast();

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteEmail.slice(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString().split("T")[0],
      lastActive: "—",
      status: "pending",
    };
    setMembers([...members, newMember]);
    setInviteEmail("");
    toast({ title: "Invitation sent", description: `Invited ${inviteEmail} as ${roleConfig[inviteRole].label}` });
  };

  const handleRoleChange = (id: string, newRole: TeamRole) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    toast({ title: "Role updated" });
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast({ title: "Member removed", variant: "destructive" });
  };

  const roleCounts = members.reduce(
    (acc, m) => ({ ...acc, [m.role]: (acc[m.role] || 0) + 1 }),
    { admin: 0, member: 0, viewer: 0 } as Record<TeamRole, number>
  );

  return (
    <div className="space-y-6">
      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Invite Team Member
          </CardTitle>
          <CardDescription>Send an invitation to join your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="email@example.com"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(roleConfig) as [TeamRole, typeof roleConfig.admin][]).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      <span>{cfg.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
              <Plus className="h-4 w-4 mr-1.5" /> Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(roleConfig) as [TeamRole, typeof roleConfig.admin][]).map(([key, cfg]) => (
          <Card key={key}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-accent ${cfg.color}`}>
                <cfg.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{roleCounts[key]}</p>
                <p className="text-[10px] text-muted-foreground">{cfg.label}s</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Team Members</CardTitle>
            <Badge variant="outline" className="text-xs">{members.length} members</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => {
            const cfg = roleConfig[member.role];
            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{member.name}</span>
                      {member.status === "pending" && (
                        <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    <p className="text-[10px] text-muted-foreground">Active: {member.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={member.role} onValueChange={(v) => handleRoleChange(member.id, v as TeamRole)} disabled={member.role === "admin" && roleCounts.admin <= 1}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <div className="flex items-center gap-1.5">
                        <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(roleConfig) as [TeamRole, typeof roleConfig.admin][]).map(([key, c]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
                            <span>{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(member.id)}
                    disabled={member.role === "admin" && roleCounts.admin <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Permission</th>
                  {(Object.entries(roleConfig) as [TeamRole, typeof roleConfig.admin][]).map(([key, cfg]) => (
                    <th key={key} className="text-center py-2 px-3 text-muted-foreground font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                        {cfg.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { perm: "View projects & models", admin: true, member: true, viewer: true },
                  { perm: "Create & edit projects", admin: true, member: true, viewer: false },
                  { perm: "Train & deploy models", admin: true, member: true, viewer: false },
                  { perm: "Use Playground", admin: true, member: true, viewer: true },
                  { perm: "Manage API keys", admin: true, member: false, viewer: false },
                  { perm: "Invite & remove members", admin: true, member: false, viewer: false },
                  { perm: "Manage billing", admin: true, member: false, viewer: false },
                  { perm: "Delete workspace", admin: true, member: false, viewer: false },
                ].map((row) => (
                  <tr key={row.perm} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 text-foreground">{row.perm}</td>
                    {(["admin", "member", "viewer"] as TeamRole[]).map((role) => (
                      <td key={role} className="text-center py-2.5">
                        {row[role] ? (
                          <Check className="h-3.5 w-3.5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Settings Page ---
export default function Settings() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account, API keys, and billing</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Tabs defaultValue="api-keys" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="api-keys" className="text-xs">
                <Key className="h-3.5 w-3.5 mr-1.5" /> API Keys
              </TabsTrigger>
              <TabsTrigger value="team" className="text-xs">
                <Users className="h-3.5 w-3.5 mr-1.5" /> Team
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">
                <Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs">
                <User className="h-3.5 w-3.5 mr-1.5" /> Account
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-xs">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys"><ApiKeysTab /></TabsContent>
            <TabsContent value="team"><TeamTab /></TabsContent>
            <TabsContent value="notifications"><NotificationsTab /></TabsContent>
            <TabsContent value="account"><AccountTab /></TabsContent>
            <TabsContent value="billing"><BillingTab /></TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
