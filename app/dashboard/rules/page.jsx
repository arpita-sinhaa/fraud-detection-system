"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, Trash } from "lucide-react"

export default function RulesPage() {
  const [rules, setRules] = useState([
    {
      id: "rule_1",
      name: "Velocity Check",
      description: "Detects too many transactions in a short time period",
      enabled: true,
      score: 25,
      config: {
        transactionCount: 5,
        timeWindowMinutes: 10,
      },
    },
    {
      id: "rule_2",
      name: "Geographical Anomaly",
      description: "Detects transactions from new countries",
      enabled: true,
      score: 30,
      config: {},
    },
    {
      id: "rule_3",
      name: "Time-based Pattern",
      description: "Detects transactions during suspicious hours",
      enabled: true,
      score: 15,
      config: {
        highRiskHours: [0, 1, 2, 3, 4],
      },
    },
    {
      id: "rule_4",
      name: "Amount Anomaly",
      description: "Detects transactions significantly higher than user's average",
      enabled: true,
      score: 20,
      config: {
        thresholdMultiplier: 3.0,
        minHistory: 5,
      },
    },
    {
      id: "rule_5",
      name: "Category Risk",
      description: "Detects first-time high-value purchases in risky categories",
      enabled: true,
      score: 15,
      config: {
        highRiskCategories: ["electronics", "jewelry", "gift_card", "cryptocurrency", "money_transfer"],
      },
    },
  ])

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    enabled: true,
    score: 20,
    config: {},
  })

  const [editingRule, setEditingRule] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleToggleRule = (id) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map((rule) => (rule.id === editingRule.id ? editingRule : rule)))
    } else {
      const newId = `rule_${rules.length + 1}`
      setRules([...rules, { ...newRule, id: newId }])
    }
    setDialogOpen(false)
    setEditingRule(null)
    setNewRule({
      name: "",
      description: "",
      enabled: true,
      score: 20,
      config: {},
    })
  }

  const handleDeleteRule = (id) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const handleAddNewRule = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fraud Detection Rules</h2>
          <p className="text-muted-foreground">Configure and manage the rules used for fraud detection</p>
        </div>
        <Button onClick={handleAddNewRule}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Rule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>These rules are applied to all transactions to calculate fraud scores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Rule Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-right">Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.description}</TableCell>
                  <TableCell className="text-right">{rule.score}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Configure global settings for the fraud detection system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="threshold">Fraud Score Threshold</Label>
              <div className="flex items-center gap-4">
                <Slider id="threshold" defaultValue={[50]} max={100} step={1} className="w-full" />
                <span className="w-12 text-center">50</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transactions with a score above this threshold will be marked as fraudulent
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-review">Auto-review Suspicious Transactions</Label>
                <Switch id="auto-review" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically flag transactions with medium risk scores for manual review
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Email Notifications</Label>
                <Switch id="notifications" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">Receive email notifications for high-risk transactions</p>
            </div>

            <Button className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
            <DialogDescription>Configure the parameters for this fraud detection rule</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={editingRule ? editingRule.name : newRule.name}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, name: e.target.value })
                  } else {
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                }}
                placeholder="Enter rule name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-description">Description</Label>
              <Input
                id="rule-description"
                value={editingRule ? editingRule.description : newRule.description}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, description: e.target.value })
                  } else {
                    setNewRule({ ...newRule, description: e.target.value })
                  }
                }}
                placeholder="Describe what this rule detects"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-score">Score Weight</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="rule-score"
                  value={[editingRule ? editingRule.score : newRule.score]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={(value) => {
                    if (editingRule) {
                      setEditingRule({ ...editingRule, score: value[0] })
                    } else {
                      setNewRule({ ...newRule, score: value[0] })
                    }
                  }}
                />
                <span className="w-12 text-center">{editingRule ? editingRule.score : newRule.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The weight this rule contributes to the overall fraud score
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-type">Rule Type</Label>
              <Select
                defaultValue="custom"
                onValueChange={(value) => {
                  // In a real app, this would load predefined configurations
                }}
              >
                <SelectTrigger id="rule-type">
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="velocity">Velocity Check</SelectItem>
                  <SelectItem value="geo">Geographical Anomaly</SelectItem>
                  <SelectItem value="amount">Amount Anomaly</SelectItem>
                  <SelectItem value="time">Time Pattern</SelectItem>
                  <SelectItem value="custom">Custom Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="rule-enabled">Enabled</Label>
              <Switch
                id="rule-enabled"
                checked={editingRule ? editingRule.enabled : newRule.enabled}
                onCheckedChange={(checked) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, enabled: checked })
                  } else {
                    setNewRule({ ...newRule, enabled: checked })
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

