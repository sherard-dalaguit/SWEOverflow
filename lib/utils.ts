import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { techMap } from "@/constants/techMap"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDeviconClassName = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  return techMap[normalizedTechName]
    ? `${techMap[normalizedTechName]} colored`
    : "devicon-devicon-plain";
};

export function getTechDescription(techName: string): string {
  const normalizedTech = techName.replace(/[ .]/g, "").toLowerCase();

  const techDescriptionMap: { [key: string]: string } = {
    javascript: "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",
    typescript: "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",
    react: "React is a popular library for building fast, component-based user interfaces and web applications.",
    nextjs: "Next.js is a React framework for building fast, SEO-friendly, and production-grade web applications.",
    nodejs: "Node.js is a runtime for building fast and scalable server-side applications using JavaScript.",
    python: "Python is a beginner-friendly language known for its versatility and simplicity in various fields.",
    java: "Java is a versatile, cross-platform language widely used in enterprise and Android development.",
    "c++": "C++ is a high-performance language ideal for system programming, games, and large-scale applications.",
    git: "Git is a version control system that helps developers track changes and collaborate on code efficiently.",
    docker: "Docker simplifies app deployment by containerizing environments, ensuring consistency across platforms.",
    mongodb: "MongoDB is a flexible NoSQL database ideal for handling unstructured data and scalable applications.",
    mysql: "MySQL is a popular open-source relational database management system known for its stability and performance.",
    postgresql: "PostgreSQL is a powerful open-source SQL database known for its scalability and robustness.",
    aws: "Amazon Web Services (AWS) is a cloud computing platform that offers a wide range of services for building, deploying, and managing web and mobile applications.",
  };

  return (
    techDescriptionMap[normalizedTech] ||
    `${techName} is a technology or tool widely used in software development, providing valuable features and capabilities.`
  );
}

export const getTimeStamp = (createdAt: Date) => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  } else {
    return number.toString();
  }
}