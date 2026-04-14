"use client";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { useCallback, useEffect, useState } from "react";

type CardSearchProps = {
  topics: string[];
  onSearch: (search: string) => void;
  onTopicFilter: (topic: string | null) => void;
  onDueFilter: (due: "all" | "due" | "not-due") => void;
};

export default function CardSearch({
  topics,
  onSearch,
  onTopicFilter,
  onDueFilter,
}: CardSearchProps) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDue, setSelectedDue] = useState<"all" | "due" | "not-due">("all");

  const debounceSearch = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => {
        onSearch(value.trim());
      }, 300);

      return timeoutId;
    },
    [onSearch]
  );

  useEffect(() => {
    const timeoutId = debounceSearch(searchInput);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput, debounceSearch]);

  const handleTopicChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedTopic(value);

    if (value === "all") {
      onTopicFilter(null);
      return;
    }

    onTopicFilter(value);
  };

  const handleDueChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as "all" | "due" | "not-due";
    setSelectedDue(value);
    onDueFilter(value);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <TextField
        label="Search cards"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        size="small"
        className="w-full"
      />

      <FormControl size="small" className="w-full md:max-w-xs">
        <InputLabel id="topic-filter-label">Topic</InputLabel>
        <Select
          labelId="topic-filter-label"
          label="Topic"
          value={selectedTopic}
          onChange={handleTopicChange}
        >
          <MenuItem value="all">All Topics</MenuItem>
          {topics.map((topic) => (
            <MenuItem key={topic} value={topic}>
              {topic}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" className="w-full md:max-w-xs">
        <InputLabel id="due-filter-label">Due</InputLabel>
        <Select
          labelId="due-filter-label"
          label="Due"
          value={selectedDue}
          onChange={handleDueChange}
        >
          <MenuItem value="all">All Cards</MenuItem>
          <MenuItem value="due">Due Now</MenuItem>
          <MenuItem value="not-due">Not Due</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
