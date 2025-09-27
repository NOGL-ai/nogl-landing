import React from 'react';
import SidebarLayout from '@/components/Sidebar/SidebarLayout';
import StatWidget from '@/components/Dashboard/StatWidget';
import StackedBarChart from '@/components/Dashboard/StackedBarChart';
import PieChart from '@/components/Dashboard/PieChart';
import DataTable from '@/components/Dashboard/DataTable';
import LoadingChart from '@/components/Dashboard/LoadingChart';
import GradientSpinner from '@/components/Dashboard/GradientSpinner';
import { getDictionary } from '@/libs/dictionary';
import { Locale } from '@/i18n';

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@pricefy.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };


  // Sample data for widgets
  const priceChangesData = [
    { month: dict.dashboard.months.jan, overpriced: 16, samePrice: 65, competitive: 80 },
    { month: dict.dashboard.months.feb, overpriced: 29, samePrice: 34, competitive: 54 },
    { month: dict.dashboard.months.mar, overpriced: 45, samePrice: 32, competitive: 82 },
    { month: dict.dashboard.months.apr, overpriced: 16, samePrice: 22, competitive: 76 },
    { month: dict.dashboard.months.may, overpriced: 36, samePrice: 44, competitive: 80 },
    { month: dict.dashboard.months.jun, overpriced: 28, samePrice: 21, competitive: 58 },
    { month: dict.dashboard.months.jul, overpriced: 16, samePrice: 48, competitive: 80 },
    { month: dict.dashboard.months.aug, overpriced: 16, samePrice: 44, competitive: 45 },
    { month: dict.dashboard.months.sep, overpriced: 16, samePrice: 32, competitive: 17 },
    { month: dict.dashboard.months.oct, overpriced: 30, samePrice: 54, competitive: 80 },
    { month: dict.dashboard.months.nov, overpriced: 16, samePrice: 18, competitive: 80 },
    { month: dict.dashboard.months.dec, overpriced: 16, samePrice: 65, competitive: 80 },
  ];

  const pieChartData = [
    { label: dict.dashboard.pieChartLabels.overpriced, value: 1105, percentage: 87.50, color: '#FB3748' },
    { label: dict.dashboard.pieChartLabels.samePrice, value: 158, percentage: 12.50, color: '#CACFD8' },
    { label: dict.dashboard.pieChartLabels.competitive, value: 95, percentage: 7.50, color: '#1FC16B' },
  ];

  const competitorColumns = [
    { id: 'product', label: dict.dashboard.product, sortable: true, width: '300px' },
    { id: 'competitor', label: dict.dashboard.competitor, sortable: true, width: '180px' },
    { id: 'change', label: dict.dashboard.change, sortable: true, width: '180px' },
    { id: 'time', label: dict.dashboard.time, sortable: true, width: '100px' },
  ];

  const competitorData = [
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'deloox.com',
        logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=32&h=32&fit=crop&auto=format'
      },
      change: { from: '$110.49', to: '$99.49' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'amazon.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC41NzY5IDEyLjc2MjFDOS45OTkzMiAxMy41OTQ4IDkuNzEwNTMgMTQuNTk3NiA5LjcxMDUzIDE1Ljc3MjFIOy43MDcwM0M5LjcwNzAzIDE3LjI1MTcgMTAuMTI3MSAxOC4zOTY0IDEwLjk2NzIgMTkuMjAyOEMxMS44MDczIDIwLjAwOTIgMTIuODgxOSAyMC40MTI0IDE0LjE4NzYgMjAuNDEyNEMxNS4wMzY0IDIwLjQxMjQgMTUuNzUwNSAyMC4zMjgzIDE2LjMyODEgMjAuMTU2NUMxNy4yNDM1IDE5LjkwMDYgMTguMTc2MyAxOS4yNTU0IDE5LjEyODUgMTguMjE3NkMxOS4xOTY3IDE4LjMwMzUgMTkuMzE1NyAxOC40NjgzIDE5LjQ4NzMgMTguNzE3MkMxOS42NTUzIDE4Ljk2NDQgMTkuNzc3OCAxOS4xMjc1IDE5Ljg1NDggMTkuMjE1MUMxOS45MzAxIDE5LjI5OTMgMjAuMDU3OCAxOS40MzYgMjAuMjM2MyAxOS42MjE4QzIwLjQxNDkgMTkuODA5NCAyMC42MjE0IDIwLjAwNTcgMjAuODU5NCAyMC4yMDkxQzIxLjE0ODIgMjAuMzI4MyAyMS4zOTUgMjAuMzEwOCAyMS41OTggMjAuMTU2NUMyMS43MTcgMjAuMDU0OCAyMi40ODAxIDE5LjM5MzkgMjMuODkwOCAxOC4xNjY4QzI0LjAyNzMgMTguMDY1MSAyNC4wOTM4IDE3Ljk0NTkgMjQuMDkzOCAxNy44MTA5QzI0LjA5MzggMTcuNjkxNyAyNC4wNDMxIDE3LjU1NSAyMy45NDE2IDE3LjQwMjRMMjMuMzU3IDE2LjYyNDFDMjMuMjM4IDE2LjQ2MjggMjMuMTEyIDE2LjE5OTggMjIuOTg5NCAxNS44MzE3QzIyLjg1OTkgMTUuNDY4OCAyMi43OTY5IDE1LjA2NTYgMjIuNzk2OSAxNC42MjIxVjguNDUxMzNDMjIuNzk2OSA4LjM4NDcxIDIyLjc4OTkgOC4xNjczMyAyMi43NzI0IDcuODAyNjlDMjIuNzU0OSA3LjQzODA2IDIyLjczMDQgNy4xOTc4OSAyMi42OTU0IDcuMDg3NDVDMjIuNjYzOSA2Ljk3NyAyMi42MTE0IDYuNzc3MTUgMjIuNTQxNCA2LjQ5MTQxQzIyLjQ3NDkgNi4yMDA0IDIyLjQwMTQgNS45Nzk1MSAyMi4zMTM5IDUuODI1MjRDMjIuMjMxNiA1LjY3MDk3IDIyLjExNDMgNS40OTkxNyAyMS45NjkxIDUuMzAyODNDMjEuODIzOCA1LjEwODI0IDIxLjY2OCA0LjkyNDE3IDIxLjUgNC43NTQxMkMyMC40MTE0IDMuNzUxMzcgMTguOTAwOSAzLjI1IDE2Ljk2NjkgMy4yNUgxNi4zMzE2QzE0LjgyMjkgMy4zMzQxNSAxMy41MDE1IDMuNzQyNjEgMTIuMzcyNiA0LjQ3MzY0QzExLjI0NTUgNS4yMDQ2NiAxMC41MzY2IDYuMzI2NjIgMTAuMjQ3OCA3LjgzOTUxQzEwLjIzMDMgNy45MDc4OCAxMC4yMjE2IDcuOTY1NzMgMTAuMjIxNiA4LjAxODMyQzEwLjIyMTYgOC4yNTY3NCAxMC4zNjY5IDguNDA5MjUgMTAuNjUzOSA4LjQ3OTM4TDEzLjU4MiA4LjgzN0MxMy44NTMzIDguNzg2MTYgMTQuMDIzMSA4LjU4OTgyIDE0LjA5MzEgOC4yNDk3MkMxNC4yMTAzIDcuNzA2MjggMTQuNDcyOSA3LjI4MDI4IDE0Ljg4MDcgNi45NzM1QzE1LjI4ODUgNi42NjQ5NiAxNS43NzMzIDYuNDg5NjUgMTYuMzMzNCA2LjQzNzA2SDE2LjUzMTFDMTcuMjk2IDYuNDM3MDYgMTcuODU2IDYuNjkzMDEgMTguMjExMyA3LjIwNDlDMTguNDQ3NiA3LjU3NjU1IDE4LjU3MDEgOC4zMDkzMyAxOC41NzAxIDkuMzk2MjJWOS44MjkyM0MxNy41MzQgOS45MTMzOCAxNi43ODQ5IDkuOTc5OTkgMTYuMzI5OSAxMC4wMzI2QzE0Ljk4OTIgMTAuMjAyNiAxMy44NjAzIDEwLjQ4MzEgMTIuOTQ0OSAxMC44NzQxQzExLjk0MjEgMTEuMyAxMS4xNTQ1IDExLjkyOTQgMTAuNTc2OSAxMi43NjIxWk0xNC41ODQ5IDE2Ljg1NTVDMTQuMjU0MSAxNi40NTIzIDE0LjA4OTYgMTUuOTIyOSAxNC4wODk2IDE1LjI2MDJMMTQuMDg3OCAxNS4yNjJDMTQuMDg3OCAxMy43OTk5IDE0LjgzMzQgMTIuODU2OCAxNi4zMjgxIDEyLjQzMjVDMTYuODM1NyAxMi4yOTc1IDE3LjU4MyAxMi4yMjc0IDE4LjU2ODQgMTIuMjI3NFYxMi44NjM4QzE4LjU2ODQgMTMuNDA3MiAxOC41NjQ5IDEzLjc5OTkgMTguNTU2MSAxNC4wMzgzQzE4LjU0NzQgMTQuMjc2NyAxOC40OTY2IDE0LjU4NyAxOC40MDM5IDE0Ljk2NzRDMTguMzA5NCAxNS4zNDk2IDE4LjE2OTMgMTUuNzAyIDE3Ljk4MzggMTYuMDI2M0MxNy41OTM1IDE2Ljc1NzMgMTcuMDQwNCAxNy4yMTQ5IDE2LjMyOTkgMTcuNDAyNEMxNi4yOTQ5IDE3LjQwMjQgMTYuMjMwMSAxNy40MTEyIDE2LjEzNzMgMTcuNDI4N0MxNi4wNDI4IDE3LjQ0NDUgMTUuOTcyOCAxNy40NTE1IDE1LjkyMDMgMTcuNDUxNUMxNS4zNjAyIDE3LjQ1MTUgMTQuOTE3NCAxNy4yNTM0IDE0LjU4NDkgMTYuODU1NVoiIGZpbGw9IiMyMjFGMUYiLz4KPHBhdGggZD0iTTI0LjkzMzEgMjMuMjY3QzI0Ljg2ODMgMjMuMzM1MyAyNC44MTU4IDIzLjQwMiAyNC43ODA4IDIzLjQ3MjFWMjMuNDc1NkMyNC43NjMzIDIzLjUwODkgMjQuNzU2MyAyMy41MzM0IDI0Ljc1NjMgMjMuNTUxQzI0LjczODggMjMuNTg2IDI0Ljc0NTggMjMuNjE3NiAyNC43ODA4IDIzLjY1MjZDMjQuODE1OCAyMy42ODc3IDI0Ljg4MDUgMjMuNzA1MiAyNC45ODU2IDIzLjcwNTJDMjUuMzQwOSAyMy42NTQ0IDI1LjczMTIgMjMuNjA1MyAyNi4xNTgyIDIzLjU1MjdDMjYuNTQ2OCAyMy41MTc3IDI2Ljg4NjMgMjMuNTAwMSAyNy4xNzMzIDIzLjUwMDFDMjcuOTU1NyAyMy41MDAxIDI4LjQzIDIzLjYwMzYgMjguNTk5OCAyMy44MDUyQzI4LjY2NjMgMjMuODg5MyAyOC43MDEzIDI0LjAyNiAyOC43MDEzIDI0LjIxMzZDMjguNzAxMyAyNC43OTIxIDI4LjM4OTcgMjUuODE5NCAyNy43NTk3IDI3LjI5OUMyNy43MDg5IDI3LjQzNCAyNy43MzE3IDI3LjUyNjkgMjcuODM2NyAyNy41Nzk1QzI3Ljg2ODIgMjcuNTk1MyAyNy45MDMyIDI3LjYwNCAyNy45MzgyIDI3LjYwNEMyOC4wMDY0IDI3LjYwNCAyOC4wODE3IDI3LjU3MjUgMjguMTY5MiAyNy41MDI0QzI4Ljc0MzMgMjcuMDA5OCAyOS4xOTMxIDI2LjM1NzYgMjkuNTE2OSAyNS41NTEyQzI5LjgzODkgMjQuNzQ0OCAyOS45OTk5IDI0LjA0MzYgMjkuOTk5OSAyMy40NDczVjIzLjI2ODdDMjkuOTk5OSAyMy4wNjU0IDI5Ljk2ODQgMjIuOTEyOSAyOS44OTg0IDIyLjgxMjlDMjkuNzQ3OSAyMi42MjM2IDI5LjI4NzYgMjIuNDk3NCAyOC41MjI4IDIyLjQyNzNDMjguMzcyMiAyMi4zOTQgMjguMjA5NSAyMi4zODM0IDI4LjAzOTcgMjIuNDAxQzI3LjQyODkgMjIuNDE4NSAyNi44MDA1IDIyLjUxMzIgMjYuMTU4MiAyMi42ODE1QzI1Ljc2NjIgMjIuNzgzMSAyNS4zNTg0IDIyLjk3OTUgMjQuOTMzMSAyMy4yNjdaIiBmaWxsPSIjRkY5OTAwIi8+CjxwYXRoIGQ9Ik0yLjQ1ODU2IDIzLjAxMjdDMi4yNzEyOCAyMi44OTM1IDIuMTM2NTIgMjIuOTAyMiAyLjA1MjUxIDIzLjAzOUMyLjAxNzUgMjMuMDg5OCAyIDIzLjEzODkgMiAyMy4xOTE1QzIgMjMuMjc1NiAyLjA1MjUxIDIzLjM2MzMgMi4xNTU3NyAyMy40NDU3QzQuMDIzMjUgMjUuMTI4NiA2LjEzNDAyIDI2LjQzNDcgOC40OTY4MSAyNy4zNjAzQzEwLjg1NDQgMjguMjg1OSAxMy4zNTcyIDI4Ljc1MDUgMTYuMDA1MyAyOC43NTA1QzE3LjcyMDUgMjguNzUwNSAxOS40NzU5IDI4LjUxMDMgMjEuMjczNCAyOC4wMzdDMjMuMDcyNiAyNy41NjAxIDI0LjcwMjEgMjYuODg4NyAyNi4xNiAyNi4wMjA5QzI2LjYzNjEgMjUuNzMzNCAyNy4wMjY0IDI1LjQ3NzUgMjcuMzMyNyAyNS4yNTY2QzI3LjU2ODkgMjUuMDg2NiAyNy42MTYyIDI0Ljg5OSAyNy40NzI3IDI0LjY5NTZDMjcuMzI3NCAyNC40OTA1IDI3LjEyNzkgMjQuNDQxNCAyNi44NzI0IDI0LjU0MzFDMjYuODExMyAyNC41NzI5IDI2LjcxMzcgMjQuNjE1NCAyNi41Nzg0IDI0LjY3NDJMMjYuNTI5MyAyNC42OTU2TDI2LjE2MTggMjQuODQ4MUMyMi45MTg2IDI2LjA4OTMgMTkuNjMzNSAyNi43MTE2IDE2LjMwOCAyNi43MTE2QzExLjMxODIgMjYuNzExNiA2LjcwMTA5IDI1LjQ3NzUgMi40NTg1NiAyMy4wMTI3WiIgZmlsbD0iI0ZGOTkwMCIvPgo8L3N2Zz4K'
      },
      change: { from: '$89.00', to: '$120.09' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'shopify.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI1LjI0NTMgNy40NTE2OEMyNS4yMjYgNy4zMTA4NyAyNS4xMDI4IDcuMjMzMDUgMjUuMDAxIDcuMjI0NUM5OS44OTk1IDcuMjE1OTUgMjIuNzQ5MiA3LjA1NjQ3IDIyLjc0OTIgNy4wNTY0N0MyMi43NDkyIDcuMDU2NDcgMjEuMjU1OCA1LjU3MjYgMjEuMDkyIDUuNDA4NEMyMC45MjggNS4yNDQyIDIwLjYwNzcgNS4yOTQxMyAyMC40ODM0IDUuMzMwNzlDMjAuNDY1IDUuMzM2MTkgMjAuMTU3MSA1LjQzMTM0IDE5LjY0NzcgNS41ODkwMkMxOS4xNDg3IDQuMTUyMzggMTguMjY4NSAyLjgzMjAyIDE2LjcxOTYgMi44MzIwMkMxNi42NzY5IDIuODMyMDIgMTYuNjMyOSAyLjgzMzgyIDE2LjU4ODggMi44MzYzQzE2LjE0ODMgMi4yNTMyNyAxNS42MDI3IDIgMTUuMTMxNCAyQzExLjUyMzUgMiA5Ljc5OTgzIDYuNTE0MTYgOS4yNTkzNSA4LjgwODI1QzcuODU3NDYgOS4yNDMwNCA2Ljg2MTQ0IDkuNTUyMSA2LjczNDI0IDkuNTkyMTNDNS45NTE3MiA5LjgzNzc2IDUuOTI3IDkuODYyNSA1LjgyNDMgMTAuNjAwNUM1Ljc0Njc3IDExLjE1OTIgMy42OTkyMiAyNy4wMDggMy42OTkyMiAyNy4wMDhMMTkuNjU0MiAzMEwyOC4yOTkyIDI4LjEyODFDMjguMjk5MiAyOC4xMjgxIDI1LjI2NDQgNy41OTI0OSAyNS4yNDUzIDcuNDUxNjhaIiBmaWxsPSIjOTVCRjQ2Ii8+Cjwvc3ZnPgo='
      },
      change: { from: '$110.00', to: '$105.99' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'aliexpress.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMDMxMjUgM0M0LjQ5MjUzIDMgMy45NzU4NyAzLjIxNDAxIDMuNTk0OTQgMy41OTQ5NEMzLjIxNDAxIDMuOTc1ODcgMyA0LjQ5MjUzIDMgNS4wMzEyNUwzIDI2Ljk2ODhDMyAyNy41MDc1IDMuMjE0MDEgMjguMDI0MSAzLjU5NDk0IDI4LjQwNTFDMy45NzU4NyAyOC43ODYgNC40OTI1MyAyOSA1LjAzMTI1IDI5SDI2Ljk2ODhDMjcuNTA3NSAyOSAyOC4wMjQxIDI4Ljc4NiAyOC40MDUxIDI4LjQwNTFDMjguNzg2IDI4LjAyNDEgMjkgMjcuNTA3NSAyOSAyNi45Njg4VjUuMDMxMjVDMjkgNC40OTI1MyAyOC43ODYgMy45NzU4NyAyOC40MDUxIDMuNTk0OTRDMjguMDI0MSAzLjIxNDAxIDI3LjUwNzUgMyAyNi45Njg4IDNINS4wMzEyNVoiIGZpbGw9IiNFNjJFMDQiLz4KPC9zdmc+Cg=='
      },
      change: { from: '$99.00', to: '$79.00' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'etsy.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDI5QzIzLjE3OTcgMjkgMjkgMjMuMTc5NyAyOSAxNkMyOSA4LjgyMDMgMjMuMTc5NyAzIDE2IDNDOC44MjAzIDMgMyA4LjgyMDMgMyAxNkMzIDIzLjE3OTcgOC44MjAzIDI5IDE2IDI5WiIgZmlsbD0iI0Y1NjQwMCIvPgo8L3N2Zz4K'
      },
      change: { from: '$59.59', to: '$49.59' },
      time: `3 ${dict.dashboard.daysAgo}`
    },
  ];

  const stockColumns = [
    { id: 'product', label: dict.dashboard.product, sortable: true, width: '300px' },
    { id: 'competitor', label: dict.dashboard.competitor, sortable: true, width: '200px' },
    { id: 'stockChange', label: dict.dashboard.stockChange, sortable: true, width: '400px' },
    { id: 'time', label: dict.dashboard.time, sortable: true, width: '120px' },
  ];

  const stockData = [
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'deloox.com',
        logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=32&h=32&fit=crop&auto=format'
      },
      stockChange: { from: dict.dashboard.inStock, to: dict.dashboard.outOfStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'amazon.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC41NzY5IDEyLjc2MjFDOS45OTkzMiAxMy41OTQ4IDkuNzEwNTMgMTQuNTk3NiA5LjcxMDUzIDE1Ljc3MjFIOy43MDcwM0M5LjcwNzAzIDE3LjI1MTcgMTAuMTI3MSAxOC4zOTY0IDEwLjk2NzIgMTkuMjAyOEMxMS44MDczIDIwLjAwOTIgMTIuODgxOSAyMC40MTI0IDE0LjE4NzYgMjAuNDEyNEMxNS4wMzY0IDIwLjQxMjQgMTUuNzUwNSAyMC4zMjgzIDE2LjMyODEgMjAuMTU2NUMxNy4yNDM1IDE5LjkwMDYgMTguMTc2MyAxOS4yNTU0IDE5LjEyODUgMTguMjE3NkMxOS4xOTY3IDE4LjMwMzUgMTkuMzE1NyAxOC40NjgzIDE5LjQ4NzMgMTguNzE3MkMxOS42NTUzIDE4Ljk2NDQgMTkuNzc3OCAxOS4xMjc1IDE5Ljg1NDggMTkuMjE1MUMxOS45MzAxIDE5LjI5OTMgMjAuMDU3OCAxOS40MzYgMjAuMjM2MyAxOS42MjE4QzIwLjQxNDkgMTkuODA5NCAyMC42MjE0IDIwLjAwNTcgMjAuODU5NCAyMC4yMDkxQzIxLjE0ODIgMjAuMzI4MyAyMS4zOTUgMjAuMzEwOCAyMS41OTggMjAuMTU2NUMyMS43MTcgMjAuMDU0OCAyMi40ODAxIDE5LjM5MzkgMjMuODkwOCAxOC4xNjY4QzI0LjAyNzMgMTguMDY1MSAyNC4wOTM4IDE3Ljk0NTkgMjQuMDkzOCAxNy44MTA5QzI0LjA5MzggMTcuNjkxNyAyNC4wNDMxIDE3LjU1NSAyMy45NDE2IDE3LjQwMjRMMjMuMzU3IDE2LjYyNDFDMjMuMjM4IDE2LjQ2MjggMjMuMTEyIDE2LjE5OTggMjIuOTg5NCAxNS44MzE3QzIyLjg1OTkgMTUuNDY4OCAyMi43OTY5IDE1LjA2NTYgMjIuNzk2OSAxNC42MjIxVjguNDUxMzNDMjIuNzk2OSA4LjM4NDcxIDIyLjc4OTkgOC4xNjczMyAyMi43NzI0IDcuODAyNjlDMjIuNzU0OSA3LjQzODA2IDIyLjczMDQgNy4xOTc4OSAyMi42OTU0IDcuMDg3NDVDMjIuNjYzOSA2Ljk3NyAyMi42MTE0IDYuNzc3MTUgMjIuNTQxNCA2LjQ5MTQxQzIyLjQ3NDkgNi4yMDA0IDIyLjQwMTQgNS45Nzk1MSAyMi4zMTM5IDUuODI1MjRDMjIuMjMxNiA1LjY3MDk3IDIyLjExNDMgNS40OTkxNyAyMS45NjkxIDUuMzAyODNDMjEuODIzOCA1LjEwODI0IDIxLjY2OCA0LjkyNDE3IDIxLjUgNC43NTQxMkMyMC40MTE0IDMuNzUxMzcgMTguOTAwOSAzLjI1IDE2Ljk2NjkgMy4yNUgxNi4zMzE2QzE0LjgyMjkgMy4zMzQxNSAxMy41MDE1IDMuNzQyNjEgMTIuMzcyNiA0LjQ3MzY0QzExLjI0NTUgNS4yMDQ2NiAxMC41MzY2IDYuMzI2NjIgMTAuMjQ3OCA3LjgzOTUxQzEwLjIzMDMgNy45MDc4OCAxMC4yMjE2IDcuOTY1NzMgMTAuMjIxNiA4LjAxODMyQzEwLjIyMTYgOC4yNTY3NCAxMC4zNjY5IDguNDA5MjUgMTAuNjUzOSA4LjQ3OTM4TDEzLjU4MiA4LjgzN0MxMy44NTMzIDguNzg2MTYgMTQuMDIzMSA4LjU4OTgyIDE0LjA5MzEgOC4yNDk3MkMxNC4yMTAzIDcuNzA2MjggMTQuNDcyOSA3LjI4MDI4IDE0Ljg4MDcgNi45NzM1QzE1LjI4ODUgNi42NjQ5NiAxNS43NzMzIDYuNDg5NjUgMTYuMzMzNCA2LjQzNzA2SDE2LjUzMTFDMTcuMjk2IDYuNDM3MDYgMTcuODU2IDYuNjkzMDEgMTguMjExMyA3LjIwNDlDMTguNDQ3NiA3LjU3NjU1IDE4LjU3MDEgOC4zMDkzMyAxOC41NzAxIDkuMzk2MjJWOS44MjkyM0MxNy41MzQgOS45MTMzOCAxNi43ODQ5IDkuOTc5OTkgMTYuMzI5OSAxMC4wMzI2QzE0Ljk4OTIgMTAuMjAyNiAxMy44NjAzIDEwLjQ4MzEgMTIuOTQ0OSAxMC44NzQxQzExLjk0MjEgMTEuMyAxMS4xNTQ1IDExLjkyOTQgMTAuNTc2OSAxMi43NjIxWk0xNC41ODQ5IDE2Ljg1NTVDMTQuMjU0MSAxNi40NTIzIDE0LjA4OTYgMTUuOTIyOSAxNC4wODk2IDE1LjI2MDJMMTQuMDg3OCAxNS4yNjJDMTQuMDg3OCAxMy43OTk5IDE0LjgzMzQgMTIuODU2OCAxNi4zMjgxIDEyLjQzMjVDMTYuODM1NyAxMi4yOTc1IDE3LjU4MyAxMi4yMjc0IDE4LjU2ODQgMTIuMjI3NFYxMi44NjM4QzE4LjU2ODQgMTMuNDA3MiAxOC41NjQ5IDEzLjc5OTkgMTguNTU2MSAxNC4wMzgzQzE4LjU0NzQgMTQuMjc2NyAxOC40OTY2IDE0LjU4NyAxOC40MDM5IDE0Ljk2NzRDMTguMzA5NCAxNS4zNDk2IDE4LjE2OTMgMTUuNzAyIDE3Ljk4MzggMTYuMDI2M0MxNy41OTM1IDE2Ljc1NzMgMTcuMDQwNCAxNy4yMTQ5IDE2LjMyOTkgMTcuNDAyNEMxNi4yOTQ5IDE3LjQwMjQgMTYuMjMwMSAxNy40MTEyIDE2LjEzNzMgMTcuNDI4N0MxNi4wNDI4IDE3LjQ0NDUgMTUuOTcyOCAxNy40NTE1IDE1LjkyMDMgMTcuNDUxNUMxNS4zNjAyIDE3LjQ1MTUgMTQuOTE3NCAxNy4yNTM0IDE0LjU4NDkgMTYuODU1NVoiIGZpbGw9IiMyMjFGMUYiLz4KPHBhdGggZD0iTTI0LjkzMzEgMjMuMjY2N0MyNC44NjgzIDIzLjMzNTEgMjQuODE1OCAyMy40MDE3IDI0Ljc4MDggMjMuNDcxOFYyMy40NzUzQzI0Ljc2MzMgMjMuNTA4NyAyNC43NTYzIDIzLjUzMzIgMjQuNzU2MyAyMy41NTA3QzI0LjczODggMjMuNTg1OCAyNC43NDU4IDIzLjYxNzMgMjQuNzgwOCAyMy42NTI0QzI0LjgxNTggMjMuNjg3NSAyNC44ODA1IDIzLjcwNSAyNC45ODU2IDIzLjcwNUMyNS4zNDA5IDIzLjY1NDIgMjUuNzMxMiAyMy42MDUxIDI2LjE1ODIgMjMuNTUyNUMyNi41NDY4IDIzLjUxNzQgMjYuODg2MyAyMy40OTk5IDI3LjE3MzMgMjMuNDk5OUMyNy45NTU3IDIzLjQ5OTkgMjguNDMgMjMuNjAzMyAyOC41OTk4IDIzLjgwNDlDMjguNjY2MyAyMy44ODkxIDI4LjcwMTMgMjQuMDI1OCAyOC43MDEzIDI0LjIxMzRDMjguNzAxMyAyNC43OTE5IDI4LjM4OTcgMjUuODE5MiAyNy43NTk3IDI3LjI5ODhDMjcuNzA4OSAyNy40MzM4IDI3LjczMTcgMjcuNTI2NyAyNy44MzY3IDI3LjU3OTNDMjcuODY4MiAyNy41OTUgMjcuOTAzMiAyNy42MDM4IDI3LjkzODIgMjcuNjAzOEMyOC4wMDY0IDI3LjYwMzggMjguMDgxNyAyNy41NzIyIDI4LjE2OTIgMjcuNTAyMUMyOC43NDMzIDI3LjAwOTUgMjkuMTkzMSAyNi4zNTc0IDI5LjUxNjkgMjUuNTUxQzI5LjgzODkgMjQuNzQ0NiAyOS45OTk5IDI0LjA0MzMgMjkuOTk5OSAyMy40NDczVjIzLjI2ODVDMjkuOTk5OSAyMy4wNjUxIDI5Ljk2ODQgMjIuOTEyNiAyOS44OTg0IDIyLjgxMjdDMjkuNzQ3OSAyMi42MjM0IDI5LjI4NzYgMjIuNDk3MSAyOC41MjI4IDIyLjQyN0MyOC4zNzIyIDIyLjM5MzcgMjguMjA5NSAyMi4zODMyIDI4LjAzOTcgMjIuNDAwN0MyNy40Mjg5IDIyLjQxODMgMjYuODAwNSAyMi41MTI5IDI2LjE1ODIgMjIuNjgxMkMyNS43NjYyIDIyLjc4MjkgMjUuMzU4NCAyMi45NzkyIDI0LjkzMzEgMjMuMjY2N1oiIGZpbGw9IiNGRjk5MDAiLz4KPHBhdGggZD0iTTIuNDU4NTYgMjMuMDEyNEMyLjI3MTI4IDIyLjg5MzIgMi4xMzY1MiAyMi45MDIgMi4wNTI1MSAyMy4wMzg3QzIuMDE3NSAyMy4wODk2IDIgMjMuMTM4NyAyIDIzLjE5MTNDMiAyMy4yNzU0IDIuMDUyNTEgMjMuMzYzMSAyLjE1NTc3IDIzLjQ0NTRDNC4wMjMyNSAyNS4xMjg0IDYuMTM0MDIgMjYuNDM0NCA4LjQ5NjgxIDI3LjM2QzEwLjg1NDQgMjguMjg1NiAxMy4zNTcyIDI4Ljc1MDIgMTYuMDA1MyAyOC43NTAyQzE3LjcyMDUgMjguNzUwMiAxOS40NzU5IDI4LjUxIDIxLjI3MzQgMjguMDM2N0MyMy4wNzI2IDI3LjU1OTkgMjQuNzAyMSAyNi44ODg1IDI2LjE2IDI2LjAyMDdDMjYuNjM2MSAyNS43MzMyIDI3LjAyNjQgMjUuNDc3MiAyNy4zMzI3IDI1LjI1NjRDMjcuNTY4OSAyNS4wODYzIDI3LjYxNjIgMjQuODk4NyAyNy40NzI3IDI0LjY5NTRDMjcuMzI3NCAyNC40OTAzIDI3LjEyNzkgMjQuNDQxMiAyNi44NzI0IDI0LjU0MjlDMjYuODExMyAyNC41NzI3IDI2LjcxMzcgMjQuNjE1MSAyNi41Nzg0IDI0LjY3NEwyNi41MjkzIDI0LjY5NTRMMjYuMTYxOCAyNC44NDc5QzIyLjkxODYgMjYuMDg5MSAxOS42MzM1IDI2LjcxMTQgMTYuMzA4IDI2LjcxMTRDMTEuMzE4MiAyNi43MTE0IDYuNzAxMDkgMjUuNDc3MiAyLjQ1ODU2IDIzLjAxMjRaIiBmaWxsPSIjRkY5OTAwIi8+Cjwvc3ZnPgo='
      },
      stockChange: { from: dict.dashboard.outOfStock, to: dict.dashboard.inStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'shopify.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI1LjI0NTMgNy40NTE2OEMyNS4yMjYgNy4zMTA4NyAyNS4xMDI4IDcuMjMzMDUgMjUuMDAxIDcuMjI0NUM5OS44OTk1IDcuMjE1OTUgMjIuNzQ5MiA3LjA1NjQ3IDIyLjc0OTIgNy4wNTY0N0MyMi43NDkyIDcuMDU2NDcgMjEuMjU1OCA1LjU3MjYgMjEuMDkyIDUuNDA4NEMyMC45MjggNS4yNDQyIDIwLjYwNzcgNS4yOTQxMyAyMC40ODM0IDUuMzMwNzlDMjAuNDY1IDUuMzM2MTkgMjAuMTU3MSA1LjQzMTM0IDE5LjY0NzcgNS41ODkwMkMxOS4xNDg3IDQuMTUyMzggMTguMjY4NSAyLjgzMjAyIDE2LjcxOTYgMi44MzIwMkMxNi42NzY5IDIuODMyMDIgMTYuNjMyOSAyLjgzMzgyIDE2LjU4ODggMi44MzYzQzE2LjE0ODMgMi4yNTMyNyAxNS42MDI3IDIgMTUuMTMxNCAyQzExLjUyMzUgMiA5Ljc5OTgzIDYuNTE0MTYgOS4yNTkzNSA4LjgwODI1QzcuODU3NDYgOS4yNDMwNCA2Ljg2MTQ0IDkuNTUyMSA2LjczNDI0IDkuNTkyMTNDNS45NTE3MiA5LjgzNzc2IDUuOTI3IDkuODYyNSA1LjgyNDMgMTAuNjAwNUM1Ljc0Njc3IDExLjE1OTIgMy42OTkyMiAyNy4wMDggMy42OTkyMiAyNy4wMDhMMTkuNjU0MiAzMEwyOC4yOTkyIDI4LjEyODFDMjguMjk5MiAyOC4xMjgxIDI1LjI2NDQgNy41OTI0OSAyNS4yNDUzIDcuNDUxNjhaIiBmaWxsPSIjOTVCRjQ2Ii8+Cjwvc3ZnPgo='
      },
      stockChange: { from: dict.dashboard.inStock, to: dict.dashboard.outOfStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'aliexpress.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMDMxMjUgM0M0LjQ5MjUzIDMgMy45NzU4NyAzLjIxNDAxIDMuNTk0OTQgMy41OTQ5NEMzLjIxNDAxIDMuOTc1ODcgMyA0LjQ5MjUzIDMgNS4wMzEyNUwzIDI2Ljk2ODhDMyAyNy41MDc1IDMuMjE0MDEgMjguMDI0MSAzLjU5NDk0IDI4LjQwNTFDMy45NzU4NyAyOC43ODYgNC40OTI1MyAyOSA1LjAzMTI1IDI5SDI2Ljk2ODhDMjcuNTA3NSAyOSAyOC4wMjQxIDI4Ljc4NiAyOC40MDUxIDI4LjQwNTFDMjguNzg2IDI4LjAyNDEgMjkgMjcuNTA3NSAyOSAyNi45Njg4VjUuMDMxMjVDMjkgNC40OTI1MyAyOC43ODYgMy45NzU4NyAyOC40MDUxIDMuNTk0OTRDMjguMDI0MSAzLjIxNDAxIDI3LjUwNzUgMyAyNi45Njg4IDNINS4wMzEyNVoiIGZpbGw9IiNFNjJFMDQiLz4KPC9zdmc+Cg=='
      },
      stockChange: { from: dict.dashboard.inStock, to: dict.dashboard.outOfStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
    {
      product: {
        name: 'Dior Sauvage Eau de Toilette 75ml Special Edition',
        brand: `${dict.dashboard.brand}: Dior`,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=40&h=40&fit=crop&auto=format'
      },
      competitor: {
        name: 'etsy.com',
        logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAzMiAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDI5QzIzLjE3OTcgMjkgMjkgMjMuMTc5NyAyOSAxNkMyOSA4LjgyMDMgMjMuMTc5NyAzIDE2IDNDOC44MjAzIDMgMyA4LjgyMDMgMyAxNkMzIDIzLjE3OTcgOC44MjAzIDI5IDE2IDI5WiIgZmlsbD0iI0Y1NjQwMCIvPgo8L3N2Zz4K'
      },
      stockChange: { from: dict.dashboard.inStock, to: dict.dashboard.outOfStock },
      time: `3 ${dict.dashboard.daysAgo}`
    },
  ];

  return (
    <SidebarLayout user={user}>
      <div className="min-h-screen bg-[#F6F8FA] dark:bg-gray-900 p-5">
        {/* Page Header */}
        <div className="mb-3 bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-1.5 flex-1">
              <div className="flex flex-col items-start gap-1 flex-1">
                <h1 
                  className="text-[#14151A] dark:text-white font-bold text-2xl leading-8"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '24px',
                    lineHeight: '32px',
                    letterSpacing: '-0.336px'
                  }}
                >
                  {dict.dashboard.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1.25">
              <div className="flex items-center gap-1.09">
                <div className="w-3.5 h-3.5 flex justify-center items-center">
                  <svg width="17" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.2357 13.9795H2.76693C2.38455 13.9795 2.07422 14.2898 2.07422 14.6722C2.07422 15.0546 2.38455 15.3649 2.76693 15.3649H15.2357C15.6181 15.3649 15.9284 15.0546 15.9284 14.6722C15.9284 14.2898 15.6181 13.9795 15.2357 13.9795Z" fill="#15161B"/>
                    <path d="M7.04552 13.286C7.56713 13.286 8.08874 13.0871 8.48566 12.6902L13.7135 7.46235C13.9844 7.19151 13.9844 6.75371 13.7135 6.48287L8.01047 0.779797C7.73962 0.508948 7.30183 0.508948 7.03098 0.779797L1.80241 6.00697C1.00857 6.80082 1.00857 8.09341 1.80241 8.88726L5.60469 12.6895C6.0023 13.0871 6.52391 13.286 7.04552 13.286ZM7.52072 2.24834L12.2443 6.97192L12.1639 7.05227H2.73896C2.75558 7.03149 2.7632 7.00586 2.7826 6.98646L7.52072 2.24834Z" fill="#15161B"/>
                    <path d="M12.4648 11.4974C12.4648 12.4839 13.2421 13.2867 14.1966 13.2867C15.1512 13.2867 15.9284 12.4839 15.9284 11.4974C15.9284 10.7022 14.935 9.13322 14.6302 8.67188C14.4384 8.37956 13.9549 8.37956 13.763 8.67188C13.4582 9.13322 12.4648 10.7022 12.4648 11.4974Z" fill="#15161B"/>
                  </svg>
                </div>
              </div>
              <span 
                className="text-[#14151A] dark:text-gray-300 text-center text-sm leading-5"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '-0.07px'
                }}
              >
                {dict.dashboard.color}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <button className="flex justify-center items-center gap-0.5 px-2.5 py-2 bg-[rgba(10,15,41,0.04)] dark:bg-gray-700 rounded-[5px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.6654 2H14.6654V6H13.332V3.33333H10.6654V2ZM1.33203 2H5.33203V3.33333H2.66536V6H1.33203V2ZM13.332 12.6667V10H14.6654V14H10.6654V12.6667H13.332ZM2.66536 12.6667H5.33203V14H1.33203V10H2.66536V12.6667Z" fill="#0F1324" fillOpacity="0.6"/>
                </svg>
              </button>
              <button className="flex justify-center items-center gap-0.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-[#E2E4E9] dark:border-gray-600 rounded-[5px] shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]">
                <div className="flex justify-center items-center p-[1.333px]">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.88759 1.44558V4.77892C5.88759 5.44558 5.44314 5.89003 4.77648 5.89003H1.44314C0.776476 5.89003 0.332031 5.44558 0.332031 4.77892V1.44558C0.332031 0.778917 0.776476 0.334473 1.44314 0.334473H4.77648C5.44314 0.334473 5.88759 0.778917 5.88759 1.44558Z" fill="#335CFF"/>
                    <path d="M13.6649 1.44558V4.77892C13.6649 5.44558 13.2205 5.89003 12.5538 5.89003H9.22049C8.55382 5.89003 8.10938 5.44558 8.10938 4.77892V1.44558C8.10938 0.778917 8.55382 0.334473 9.22049 0.334473H12.5538C13.2205 0.334473 13.6649 0.778917 13.6649 1.44558Z" fill="#97BAFF"/>
                    <path d="M5.88759 9.22342V12.5567C5.88759 13.2234 5.44314 13.6679 4.77648 13.6679H1.44314C0.776476 13.6679 0.332031 13.2234 0.332031 12.5567V9.22342C0.332031 8.55675 0.776476 8.1123 1.44314 8.1123H4.77648C5.44314 8.1123 5.88759 8.55675 5.88759 9.22342Z" fill="#6895FF"/>
                    <path d="M12.5538 13.6679H9.22049C8.55382 13.6679 8.10938 13.2234 8.10938 12.5567V9.22342C8.10938 8.55675 8.55382 8.1123 9.22049 8.1123H12.5538C13.2205 8.1123 13.6649 8.55675 13.6649 9.22342V12.5567C13.6649 13.2234 13.2205 13.6679 12.5538 13.6679ZM9.22049 9.22342V12.5567H12.5538V9.22342H9.22049Z" fill="#C0D5FF"/>
                  </svg>
                </div>
                <div className="flex justify-center items-center px-1">
                  <span 
                    className="text-[#14151A] dark:text-gray-300 text-center text-sm leading-5"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.07px'
                    }}
                  >
                    {dict.dashboard.editWidgets}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 p-4 mb-5">
          {/* First Row - Stat Widgets */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <StatWidget
              title={dict.dashboard.overpricedProduct}
              percentage={39.5}
              value={764}
              total={1263}
              progressColor="#FB3748"
              progressBackgroundColor="#FFEBED"
              className="h-[161px]"
            />
            <StatWidget
              title={dict.dashboard.samePriceProducts}
              percentage={0}
              value={0}
              total={1263}
              progressColor="#E1E4EA"
              progressBackgroundColor="#E1E4EA"
              className="h-[161px]"
            />
            <StatWidget
              title={dict.dashboard.competitiveProducts}
              percentage={32.5}
              value={499}
              total={1263}
              progressColor="#1FC16B"
              progressBackgroundColor="#E9F9F0"
              className="h-[161px]"
            />
          </div>

          {/* Second Row - Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
            <StackedBarChart
              data={priceChangesData}
              title={dict.dashboard.priceChangesSummary}
              className="h-[442px]"
            />
            <PieChart
              data={pieChartData}
              centerValue="1263"
              centerLabel={dict.dashboard.products}
              title={dict.dashboard.priceGroups}
              className="h-[442px]"
            />
          </div>
        </div>

        {/* Third Row - Tables and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 mb-5">
          {/* Profit Status with Missing Data */}
          <LoadingChart
            title={dict.dashboard.profitStatus}
            height="412px"
            className="w-full"
          />

          {/* Competitor Price Changes Table */}
          <DataTable
            columns={competitorColumns}
            data={competitorData}
            title={dict.dashboard.competitorPriceChanges}
            className="w-full h-[412px]"
          />
        </div>

        {/* Fourth Row - Key Vendor Insights and Smaller Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
          {/* Key Vendor Insights with Missing Data */}
          <LoadingChart
            title={dict.dashboard.keyVendorInsights}
            height="788px"
            className="w-full"
          />

          <div className="flex flex-col gap-5">
            {/* Profit Status with Missing Data */}
            <LoadingChart
              title={dict.dashboard.profitStatus}
              height="354px"
              className="w-full"
            />

            {/* Inventory Value with Missing Data */}
            <LoadingChart
              title={dict.dashboard.inventoryValue}
              height="374px"
              className="w-full"
            />
          </div>
        </div>

        {/* Fifth Row - Historical Leaders and Historical Index */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
          <div className="flex flex-col gap-5">
            <LoadingChart
              title={dict.dashboard.historicalPriceLeaders}
              height="200px"
              className="w-full"
            />
            <LoadingChart
              title={dict.dashboard.historicalIndex}
              height="200px"
              className="w-full"
            />
          </div>
          <LoadingChart
            title={dict.dashboard.inventoryValue}
            height="420px"
            className="w-full"
          />
        </div>

        {/* Sixth Row - Vendor Stock Changes */}
        <div className="bg-white rounded-lg border border-[#E2E4E9] p-4">
          <DataTable
            columns={stockColumns}
            data={stockData}
            title={dict.dashboard.vendorStockChanges}
            className="w-full"
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
