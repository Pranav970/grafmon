import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetPrometheusConfig, useUpdatePrometheusConfig, useGetAlertmanagerConfig, useUpdateAlertmanagerConfig } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { PrometheusConfig, AlertmanagerConfig } from "@workspace/api-client-react/src/generated/api.schemas";
import { Loader2, Save } from "lucide-react";

export default function Config() {
  const { toast } = useToast();

  const { data: promConfig } = useGetPrometheusConfig();
  const updatePromConfig = useUpdatePrometheusConfig();

  const promForm = useForm<PrometheusConfig>({
    defaultValues: { scrapeInterval: "15s", evaluationInterval: "15s", retentionTime: "15d" }
  });

  useEffect(() => {
    if (promConfig) {
      promForm.reset(promConfig);
    }
  }, [promConfig, promForm]);

  const onPromSubmit = (data: PrometheusConfig) => {
    updatePromConfig.mutate({ data }, {
      onSuccess: () => toast({ title: "Prometheus Config Saved", description: "Configuration updated successfully." }),
      onError: (err) => toast({ title: "Error saving config", variant: "destructive", description: String(err) })
    });
  };

  const { data: amConfig } = useGetAlertmanagerConfig();
  const updateAmConfig = useUpdateAlertmanagerConfig();

  const amForm = useForm<AlertmanagerConfig>({
    defaultValues: { slackWebhookUrl: "", slackChannel: "", discordWebhookUrl: "", emailSmtpHost: "", emailSmtpPort: 587, emailFrom: "", emailTo: "" }
  });

  useEffect(() => {
    if (amConfig) {
      amForm.reset(amConfig);
    }
  }, [amConfig, amForm]);

  const onAmSubmit = (data: AlertmanagerConfig) => {
    updateAmConfig.mutate({ data }, {
      onSuccess: () => toast({ title: "Alertmanager Config Saved", description: "Configuration updated successfully." }),
      onError: (err) => toast({ title: "Error saving config", variant: "destructive", description: String(err) })
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Configuration</h1>
        <p className="text-sm text-slate-400 mt-1">Manage infrastructure configuration settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-800/80 bg-slate-900/50 pb-4">
            <CardTitle className="text-lg text-slate-100">Prometheus</CardTitle>
            <CardDescription className="text-slate-400">Global scraping and evaluation settings.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={promForm.handleSubmit(onPromSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="scrapeInterval" className="text-slate-300">Scrape Interval</Label>
                <Input id="scrapeInterval" {...promForm.register("scrapeInterval")} placeholder="15s" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evaluationInterval" className="text-slate-300">Evaluation Interval</Label>
                <Input id="evaluationInterval" {...promForm.register("evaluationInterval")} placeholder="15s" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionTime" className="text-slate-300">Retention Time</Label>
                <Input id="retentionTime" {...promForm.register("retentionTime")} placeholder="15d" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={updatePromConfig.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                  {updatePromConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-800/80 bg-slate-900/50 pb-4">
            <CardTitle className="text-lg text-slate-100">Alertmanager Notifications</CardTitle>
            <CardDescription className="text-slate-400">Configure external notification endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={amForm.handleSubmit(onAmSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="slackWebhookUrl" className="text-slate-300">Slack Webhook URL</Label>
                <Input id="slackWebhookUrl" {...amForm.register("slackWebhookUrl")} placeholder="https://hooks.slack.com/..." className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slackChannel" className="text-slate-300">Slack Channel</Label>
                <Input id="slackChannel" {...amForm.register("slackChannel")} placeholder="#alerts" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordWebhookUrl" className="text-slate-300">Discord Webhook URL</Label>
                <Input id="discordWebhookUrl" {...amForm.register("discordWebhookUrl")} placeholder="https://discord.com/api/webhooks/..." className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailSmtpHost" className="text-slate-300">SMTP Host</Label>
                  <Input id="emailSmtpHost" {...amForm.register("emailSmtpHost")} placeholder="smtp.gmail.com" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailSmtpPort" className="text-slate-300">SMTP Port</Label>
                  <Input id="emailSmtpPort" type="number" {...amForm.register("emailSmtpPort", { valueAsNumber: true })} placeholder="587" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailFrom" className="text-slate-300">Email From</Label>
                  <Input id="emailFrom" {...amForm.register("emailFrom")} placeholder="alerts@example.com" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailTo" className="text-slate-300">Email To</Label>
                  <Input id="emailTo" {...amForm.register("emailTo")} placeholder="team@example.com" className="bg-slate-950 border-slate-700 text-slate-200 focus-visible:ring-emerald-500" />
                </div>
              </div>
              
              <div className="pt-2">
                <Button type="submit" disabled={updateAmConfig.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                  {updateAmConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
