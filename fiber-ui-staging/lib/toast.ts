import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (title: string, options?: ToastOptions) => {
    return sonnerToast.success(title, {
      ...options,
      className: "!bg-green-50 dark:!bg-green-950 !border-green-200 dark:!border-green-800",
      style: {
        color: "rgb(22 163 74)", // green-600
      },
    });
  },

  error: (title: string, options?: ToastOptions) => {
    return sonnerToast.error(title, {
      ...options,
      className: "!bg-red-50 dark:!bg-red-950 !border-red-200 dark:!border-red-800",
      style: {
        color: "rgb(220 38 38)", // red-600
      },
    });
  },

  info: (title: string, options?: ToastOptions) => {
    return sonnerToast.info(title, {
      ...options,
      className: "!bg-blue-50 dark:!bg-blue-950 !border-blue-200 dark:!border-blue-800",
      style: {
        color: "rgb(37 99 235)", // blue-600
      },
    });
  },

  warning: (title: string, options?: ToastOptions) => {
    return sonnerToast.warning(title, {
      ...options,
      className: "!bg-yellow-50 dark:!bg-yellow-950 !border-yellow-200 dark:!border-yellow-800",
      style: {
        color: "rgb(202 138 4)", // yellow-600
      },
    });
  },

  default: (title: string, options?: ToastOptions) => {
    return sonnerToast(title, options);
  },
};
