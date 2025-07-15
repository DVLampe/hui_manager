'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import Layout from '../../components/shared/Layout';
import Card from '../../components/ui/Card'; // Corrected import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Кол-во hụi',
      data: [2, 3, 1, 4, 2, 5, 3],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      yAxisID: 'y',
    },
    {
      label: 'Прибыль/убыток',
      data: [1000, -500, 2000, 1500, -200, 3000, 2500],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      yAxisID: 'y1',
    },
  ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Кол-во hụi',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Прибыль/убыток ($)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

const huiData = [
  {
    name: 'Hui #1',
    ky: 10,
    amount: 5000,
    status: 'active',
    profit: 1200,
  },
  {
    name: 'Hui #2',
    ky: 5,
    amount: 2500,
    status: 'completed',
    profit: -300,
  },
  {
    name: 'Hui #3',
    ky: 12,
    amount: 6000,
    status: 'active',
    profit: 2500,
  },
];

export default function DashboardPage() {
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Дашборд</h1>
            <p className="text-gray-500 mt-1">
              Ваша персональная статистика по участию в hụi.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card title="Всего hụi">
                <p className="text-3xl font-bold">12</p>
            </Card>
            <Card title="Всего заплачено">
                <p className="text-3xl font-bold">$15,200</p>
            </Card>
            <Card title="Всего получено">
                <p className="text-3xl font-bold">$18,500</p>
            </Card>
            <Card title="Прибыль/Убыток">
                <p className="text-3xl font-bold text-green-600">$3,300</p>
            </Card>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 h-96">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Помесячная статистика</h2>
            <div className="relative h-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Hui List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Список hụi</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Кол-во ky</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Прибыль/Убыток</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {huiData.map((hui) => (
                    <TableRow key={hui.name}>
                      <TableCell>{hui.name}</TableCell>
                      <TableCell>{hui.ky}</TableCell>
                      <TableCell>${hui.amount}</TableCell>
                      <TableCell>
                        <Badge variant={hui.status === 'active' ? 'default' : 'secondary'}>
                          {hui.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={hui.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                        ${hui.profit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
