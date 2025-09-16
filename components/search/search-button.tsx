import React from "react";
import Circle from "../ui/circle";
import { SearchIcon } from "../icons";

export default function SearchButton() {
  return (
    <button className="cursor-pointer">
      <Circle>
        <SearchIcon />
      </Circle>
    </button>
  );
}
