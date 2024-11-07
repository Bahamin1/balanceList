'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo, useState } from 'react'
import { FiCalendar, FiEdit2, FiPlusCircle, FiSave, FiTrash2 } from 'react-icons/fi'
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/lable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"

export default function BalanceList() {
  const [entries, setEntries] = useState([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [editingEntry, setEditingEntry] = useState(null)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const addEntry = (type) => {
    if (amount && !isNaN(amount) && description.trim() && date) {
      const newEntry = {
        id: Date.now(),
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        date,
        createdAt: new Date().toISOString(),
        editedAt: null
      }
      setEntries([...entries, newEntry])
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
    }
  }

  const editEntry = (id) => {
    const entry = entries.find(e => e.id === id)
    if (entry) {
      setEditingEntry(entry)
      setAmount(entry.amount.toString())
      setDescription(entry.description)
      setDate(entry.date)
    }
  }

  const updateEntry = () => {
    if (editingEntry && amount && !isNaN(amount) && description.trim() && date) {
      setEntries(entries.map(entry =>
        entry.id === editingEntry.id
          ? { 
              ...entry, 
              amount: parseFloat(amount), 
              description: description.trim(), 
              date,
              editedAt: new Date().toISOString()
            }
          : entry
      ))
      setEditingEntry(null)
      setAmount('')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
    }
  }

  const deleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id))
    }
  }

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      } else if (sortBy === 'highAmount') {
        return b.amount - a.amount
      } else if (sortBy === 'lowAmount') {
        return a.amount - b.amount
      } else {
        return sortOrder === 'asc' ? a.description.localeCompare(b.description) : b.description.localeCompare(a.description)
      }
    })
  }, [entries, sortBy, sortOrder])

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    return entries.reduce((acc, entry) => {
      if (entry.type === 'income') {
        acc.totalIncome += entry.amount
      } else {
        acc.totalExpenses += entry.amount
      }
      acc.balance = acc.totalIncome - acc.totalExpenses
      return acc
    }, { totalIncome: 0, totalExpenses: 0, balance: 0 })
  }, [entries])

  const monthlySummaries = useMemo(() => {
    const summaries = {}
    entries.forEach(entry => {
      const monthYear = entry.date.substring(0, 7) // YYYY-MM
      if (!summaries[monthYear]) {
        summaries[monthYear] = { income: 0, expenses: 0 }
      }
      if (entry.type === 'income') {
        summaries[monthYear].income += entry.amount
      } else {
        summaries[monthYear].expenses += entry.amount
      }
    })
    return Object.entries(summaries).sort((a, b) => b[0].localeCompare(a[0]))
  }, [entries])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Balance List</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
              <h3 className="text-lg font-semibold text-gray-800">Balance</h3>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-grow">
                <Label htmlFor="amount">Amount (TRY)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₺</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {editingEntry ? (
                <Button onClick={updateEntry} className="flex-1 bg-blue-500 hover:bg-blue-600">
                  <FiSave className="mr-2" />
                  Save Changes
                </Button>
              ) : (
                <>
                  <Button onClick={() => addEntry('income')} className="flex-1 bg-green-500 hover:bg-green-600">
                    <FiPlusCircle className="mr-2" />
                    Add Income
                  </Button>
                  <Button onClick={() => addEntry('expense')} className="flex-1 bg-red-500 hover:bg-red-600">
                    <FiPlusCircle className="mr-2" />
                    Add Expense
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4 space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="highAmount">Highest Amount</SelectItem>
                <SelectItem value="lowAmount">Lowest Amount</SelectItem>
                <SelectItem value="description">Description</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {sortedEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-3 rounded-md flex justify-between items-center ${
                    entry.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-medium">{entry.description}</span>
                      <span className="ml-2">{formatCurrency(entry.amount)}</span>
                      <span className="ml-2 text-sm text-gray-500">{entry.date}</span>
                      {entry.editedAt && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                          Edited: {formatDate(entry.editedAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(entry.createdAt)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editEntry(entry.id)}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlySummaries.map(([month, summary]) => (
              <div key={month} className="space-y-2">
                <h3 className="font-semibold">{month}</h3>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full">
                      <div
                        className="h-4 bg-green-500 rounded-full"
                        style={{ width: `${(summary.income / (summary.income + summary.expenses)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">Income: {formatCurrency(summary.income)}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full">
                      <div
                        className="h-4 bg-red-500 rounded-full"
                        style={{ width: `${(summary.expenses / (summary.income + summary.expenses)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">Expenses: {formatCurrency(summary.expenses)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}