"use client";
import { cn } from "@/lib/utils";
import useTabStore from "@/stores/tab.store";
import { TabType } from "@/types/tab.types";
import { useRef, useState, useEffect } from "react";

type TabsProps = {
  tabs: TabType[];
  tabId: string;
  className?: string;
};

export function Tabs({ tabs, tabId, className }: TabsProps) {
  const activeIndex = useTabStore.use.tabs()[tabId] ?? 0;
  const setTab = useTabStore.use.setTab();

  const ref = useRef<HTMLUListElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (ref.current) {
      const activeTab = ref.current.children[activeIndex] as HTMLElement;
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.clientWidth,
      });
    }
  }, [activeIndex]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="relative flex-shrink-0 mb-4 w-fit">
        <div className="-bottom-2 left-0 z-0 absolute bg-neutral-200 rounded-full w-full h-1.5" />
        <ul ref={ref} className="z-10 relative flex space-x-4">
          {tabs.map((tab, index) => (
            <li
              key={index}
              onClick={() => setTab(tabId, index)}
              className="px-4 py-1.5 font-semibold text-sm cursor-pointer"
            >
              {tab.title}
            </li>
          ))}
        </ul>
        <span
          className="-bottom-2 z-10 absolute bg-blue rounded-full h-1.5 transition-all duration-300"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>
      <div className="flex-1 min-h-0">{tabs[activeIndex].content}</div>
    </div>
  );
}
