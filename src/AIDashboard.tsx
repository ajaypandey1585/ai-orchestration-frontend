import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { FaRobot, FaChartBar, FaChartPie, FaChartLine, FaCoins, FaProjectDiagram, FaDollarSign } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

// Define the prop types for AIMetricsCard
interface AIMetricsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface Tile {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface Metric {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface ProjectData {
  metrics?: Metric[];
  tiles?: Tile[];
}

interface ChartData {
  name: string;
  value: number;
}

interface ColorfulTileProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}
interface ProjectData {
  trendDays: number;
  metricsData: Metric[];
  colorfulTilesData: Tile[];
  costData: ChartData[];
  tokenDistribution: ChartData[];
  responseTimeData: ChartData[];
}
interface AIChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie';
}

interface UpdateResponse {
  message: string; // Define other fields if the response contains more information
}

const AIMetricsCard: React.FC<AIMetricsCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
    </div>
    <div className="text-4xl text-indigo-500">{icon}</div>
  </div>
);

const ColorfulTile: React.FC<ColorfulTileProps> = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-lg shadow-md p-6 flex items-center justify-between`}>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <div className="text-4xl text-white">{icon}</div>
  </div>
);

const AIChart: React.FC<AIChartProps> = ({ data, type }) => {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981'];

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={colors[1]}
              label
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={colors[2]} />
          </LineChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

const AIDashboard: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('Project 1');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    if (selectedProject) {
      const intervalId = setInterval(() => {
        axios.get<{ data: ProjectData }>(`http://localhost:5000/api/getProjectData?projectName=${encodeURIComponent(selectedProject)}`)
          .then((response: AxiosResponse<{ data: ProjectData }>) => {
            setProjectData(response.data.data);
          })
          .catch((error: AxiosError) => {
            console.error('Error fetching project data:', error);
          });
      }, 30000); // 3000ms = 3 seconds
  
      // Cleanup function to clear the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [selectedProject]);
  
  if (!projectData) {
    return <div>Loading...</div>;
  }

  const { metricsData, colorfulTilesData, costData, tokenDistribution, responseTimeData } = projectData;
  // Map icon strings to actual icon components
  const iconMap = {
    FaCoins: <FaCoins />,
    FaProjectDiagram: <FaProjectDiagram />,
    FaDollarSign: <FaDollarSign />,
    FaChartBar: <FaChartBar />,
    FaChartPie: <FaChartPie />,
    FaChartLine: <FaChartLine />,
  };

    // Map color strings to Tailwind CSS classes
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      // Add more color mappings as needed
    };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-1/4 bg-white p-8 border-r border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
        <ul>
          {['AI-Orchestration'].map((project, index) => (
            <li
              key={index}
              className={`p-4 rounded-lg cursor-pointer ${selectedProject === project ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setSelectedProject(project)}
            >
              {project}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <FaRobot className="mr-4 text-indigo-600" />
            AI Dashboard
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {colorfulTilesData.map((tile, index) => (
            <ColorfulTile key={index} {...tile}
            icon={iconMap[tile.icon as keyof typeof iconMap]}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metricsData.map((metric, index) => (
            <AIMetricsCard key={index} {...metric} 
            icon={iconMap[metric.icon as keyof typeof iconMap]}
            />
          ))}
        </div>

        {/* Add charts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Data</h2>
          <AIChart data={costData} type="bar" />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Time</h2>
          <AIChart data={responseTimeData} type="line" />
        </div>

        <footer className="text-center text-gray-500">
          <p>© 2024 Changepond Technologies. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AIDashboard;