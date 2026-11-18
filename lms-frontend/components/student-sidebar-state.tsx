"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "eduflow:student-sidebar-collapsed";

type SidebarState = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

const StudentSidebarStateContext = createContext<SidebarState | null>(null);

export function StudentSidebarStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(STORAGE_KEY) === "true");
    } catch (error) {
      console.error("Không thể đọc trạng thái thanh bên đã lưu.", error);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setCollapsedState(event.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setCollapsed = useCallback<Dispatch<SetStateAction<boolean>>>(
    (value) => {
      setCollapsedState((previous) => {
        const next =
          typeof value === "function" ? value(previous) : value;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch (error) {
          console.error("Không thể lưu trạng thái thanh bên.", error);
        }
        return next;
      });
    },
    [],
  );

  return (
    <StudentSidebarStateContext.Provider value={{ collapsed, setCollapsed }}>
      <div key={pathname} className="route-transition-enter">
        {children}
      </div>
    </StudentSidebarStateContext.Provider>
  );
}

export function useStudentSidebarState() {
  const state = useContext(StudentSidebarStateContext);
  if (!state) {
    throw new Error(
      "useStudentSidebarState phải được dùng bên trong StudentSidebarStateProvider.",
    );
  }
  return state;
}
