"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CreditCard,
  DollarSign,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudulentTransactions: 0,
    fraudRate: 0,
    totalAmount: 0,
    riskScore: 0,
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setStats({
            totalTransactions: 1254,
            fraudulentTransactions: 23,
            fraudRate: 1.83,
            totalAmount: 287650.42,
            riskScore: 18,
          })

          setRecentTransactions([
            {
              id: "tx_1",
              amount: 1250.0,
              status: "Legitimate",
              user: "john.doe@example.com",
              timestamp: "2025-03-21T14:32:45",
              riskScore: 12,
            },
            {
              id: "tx_2",
              amount: 4999.99,
              status: "Fraudulent",
              user: "alice.smith@example.com",
              timestamp: "2025-03-21T13:45:22",
              riskScore: 87,
            },
            {
              id: "tx_3",
              amount: 299.5,
              status: "Legitimate",
              user: "robert.johnson@example.com",
              timestamp: "2025-03-21T12:18:05",
              riskScore: 8,
            },
            {
              id: "tx_4",
              amount: 1899.0,
              status: "Under Review",
              user: "emma.wilson@example.com",
              timestamp: "2025-03-21T11:52:33",
              riskScore: 42,
            },
            {
              id: "tx_5",
              amount: 750.25,
              status: "Legitimate",
              user: "michael.brown@example.com",
              timestamp: "2025-03-21T10:27:19",
              riskScore: 15,
            },
          ])

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Fraudulent":
        return "destructive"
      case "Under Review":
        return "warning"
      case "Legitimate":
        return "success"
      default:
        return "secondary"
    }
  }

  const getRiskBadge = (score) => {
    if (score < 20) return { label: "Low", variant: "outline" }
    if (score < 50) return { label: "Medium", variant: "warning" }
    return { label: "High", variant: "destructive" }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your fraud detection metrics and recent activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>
            Analyze Transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-4 w-4 text-success" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fraudRate}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="mr-1 inline h-4 w-4 text-success" />
              -0.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-4 w-4 text-success" />
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.riskScore}/100</div>
            <Progress value={stats.riskScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Showing the {recentTransactions.length} most recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col justify-between gap-2 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{transaction.user}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Risk:</span>
                          <Badge variant={getRiskBadge(transaction.riskScore).variant}>
                            {getRiskBadge(transaction.riskScore).label}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline">View All Transactions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Transactions</CardTitle>
              <CardDescription>Transactions that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No flagged transactions at the moment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Analytics</CardTitle>
              <CardDescription>Detailed analysis of fraud patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-80 items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Analytics dashboard is coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

