"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 定義參數類型
interface URLParams {
  nav: string | null;
  q: string | null;
  tag: string | null;
  slug: string | null;
}

// Context 類型定義
interface URLParamsContextType {
  params: URLParams;
  updateParam: (key: string, value: string | null) => void;
  navigate: (newParams: Partial<URLParams>) => void;
  reset: () => void;
}

// 創建 Context
const URLParamsContext = createContext<URLParamsContextType | null>(null);

// Provider 組件
export function URLParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 解析當前 URL 參數
  const params = useMemo<URLParams>(() => {
    try {
      return {
        nav: searchParams?.get("nav") || null,
        q: searchParams?.get("q") || null,
        tag: searchParams?.get("tag") || null,
        slug: searchParams?.get("slug") || null,
      };
    } catch (error) {
      console.error("解析 URL 參數時出錯:", error);
      return {
        nav: null,
        q: null,
        tag: null,
        slug: null,
      };
    }
  }, [searchParams]);

  // 更新單個參數
  const updateParam = (key: string, value: string | null) => {
    try {
      const newParams = new URLSearchParams(window.location.search);

      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }

      const newUrl = `/dashboard/notes${
        newParams.toString() ? "?" + newParams.toString() : ""
      }`;
      router.push(newUrl);
    } catch (error) {
      console.error("更新參數時出錯:", error);
    }
  };

  // 批量更新參數
  const navigate = (newParams: Partial<URLParams>) => {
    try {
      const currentParams = new URLSearchParams(window.location.search);

      // 更新參數
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "") {
          currentParams.delete(key);
        } else {
          currentParams.set(key, value);
        }
      });

      const newUrl = `/dashboard/notes${
        currentParams.toString() ? "?" + currentParams.toString() : ""
      }`;
      router.push(newUrl);
    } catch (error) {
      console.error("導航時出錯:", error);
    }
  };

  // 重置所有參數
  const reset = () => {
    try {
      router.push("/dashboard/notes");
    } catch (error) {
      console.error("重置參數時出錯:", error);
    }
  };

  const contextValue: URLParamsContextType = {
    params,
    updateParam,
    navigate,
    reset,
  };

  return (
    <URLParamsContext.Provider value={contextValue}>
      {children}
    </URLParamsContext.Provider>
  );
}

// 自定義 Hook 來使用 Context
export function useURLParams() {
  const context = useContext(URLParamsContext);

  if (!context) {
    throw new Error("useURLParams must be used within URLParamsProvider");
  }

  return context;
}

// 便利的 Hook 用於特定參數
export function useNavParam() {
  const { params, updateParam } = useURLParams();
  return {
    nav: params.nav,
    setNav: (value: string | null) => updateParam("nav", value),
  };
}

export function useSearchQuery() {
  const { params, updateParam } = useURLParams();
  return {
    query: params.q,
    setQuery: (value: string | null) => updateParam("q", value),
  };
}

export function useTagFilter() {
  const { params, updateParam } = useURLParams();
  return {
    tag: params.tag,
    setTag: (value: string | null) => updateParam("tag", value),
  };
}

export function useNoteSlug() {
  const { params, updateParam } = useURLParams();
  return {
    slug: params.slug,
    setSlug: (value: string | null) => updateParam("slug", value),
  };
}
