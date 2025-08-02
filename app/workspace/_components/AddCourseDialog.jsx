'use client';
import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkle, Check, ChevronsUpDown, XCircle } from "lucide-react"; // Added XCircle for removing tags
import axios from "axios";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils"; // Assuming you have this utility

// Define suggested chapter options
const CHAPTER_OPTIONS = [
  { label: "3 Chapters (Not Complex)", value: 3 },
  { label: "6 Chapters (Average Detail)", value: 6 },
  { label: "10 Chapters (Detailed Course)", value: 10 },
];

// Define a comprehensive list of categories
const CATEGORIES = [
  "Programming", "Mathematics", "Physics", "Chemistry", "Biology", "History",
  "Literature", "Art", "Music", "Philosophy", "Psychology", "Sociology",
  "Economics", "Finance", "Business", "Marketing", "Data Science",
  "Machine Learning", "Web Development", "Mobile Development", "Cybersecurity",
  "Networking", "Cloud Computing", "Game Development", "Graphic Design",
  "Video Editing", "Photography", "Creative Writing", "Foreign Languages",
  "Health & Fitness", "Nutrition", "Environmental Science", "Agriculture",
  "Engineering", "Architecture", "Law", "Medicine", "Education", "Astronomy",
  "Geology", "Anthropology", "Political Science", "Journalism", "Culinary Arts",
  "Personal Finance", "Investing", "Entrepreneurship", "Public Speaking",
  "Meditation & Mindfulness", "Yoga", "Gardening", "DIY & Home Improvement",
  "Automotive", "Electronics", "Robotics", "Blockchain", "UI/UX Design",
  "Project Management", "Supply Chain Management", "Human Resources", "Sales",
  "Customer Service", "Digital Marketing", "SEO", "Content Creation", "Animation",
  "Sculpting", "Drawing", "Painting", "Theater", "Dance", "Film Production",
  "Music Production", "Songwriting", "Instrument Learning", "Philosophy of Mind",
  "Ethics", "Logic", "Metaphysics", "Epistemology", "Cognitive Science",
  "Neuroscience", "Child Development", "Social Psychology", "Abnormal Psychology",
  "Statistics", "Calculus", "Algebra", "Geometry", "Trigonometry", "Discrete Math",
  "Quantum Mechanics", "Thermodynamics", "Electromagnetism", "Organic Chemistry",
  "Inorganic Chemistry", "Biochemistry", "Genetics", "Ecology", "Evolution",
  "World History", "Ancient History", "Modern History", "Art History", "Mythology",
  "Comparative Literature", "Poetry", "Fiction Writing", "Screenwriting",
  "Public Health", "Epidemiology", "Anatomy", "Physiology", "Pharmacology",
  "Veterinary Science", "Forestry", "Horticulture", "Animal Science"
].sort(); // Sort alphabetically for better UX

function AddCourseDialog({ children }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chapters: 0,
    includeVideo: false,
    difficulty: "",
    category: "", // This will be the comma-separated string
  });

  // State for chapters dropdown and custom input
  const [selectedChapterOption, setSelectedChapterOption] = useState('');
  const [customChapters, setCustomChapters] = useState('');

  // State for category multi-select combobox
  const [openCategoryCombobox, setOpenCategoryCombobox] = useState(false);
  const [categoryInputSearch, setCategoryInputSearch] = useState(''); // For the CommandInput
  const [selectedCategories, setSelectedCategories] = useState([]); // Array of selected categories
  const [customCategoryValue, setCustomCategoryValue] = useState(''); // For the "Other" input

  // Effect to update formData.chapters
  useEffect(() => {
    if (selectedChapterOption === 'other') {
      const num = parseInt(customChapters, 10);
      setFormData((prev) => ({ ...prev, chapters: isNaN(num) ? 0 : num }));
    } else if (selectedChapterOption) {
      setFormData((prev) => ({ ...prev, chapters: parseInt(selectedChapterOption, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, chapters: 0 }));
    }
  }, [selectedChapterOption, customChapters]);

  // Effect to update formData.category from selectedCategories and customCategoryValue
  useEffect(() => {
    let allCategories = [...selectedCategories];
    if (customCategoryValue.trim() && !allCategories.includes(customCategoryValue.trim())) {
      allCategories.push(customCategoryValue.trim());
    }
    setFormData((prev) => ({ ...prev, category: allCategories.join(', ') }));
  }, [selectedCategories, customCategoryValue]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = useCallback((categoryValue) => {
    if (categoryValue === "Other") {
      // "Other" is selected, just open the custom input, don't add "Other" to list
      setCustomCategoryValue(''); // Clear previous custom value
      setSelectedCategories([]); // Clear standard selections if "Other" is chosen
      setOpenCategoryCombobox(false);
      // The custom input will handle its value and add it to formData via useEffect
    } else {
      // Toggle selection for standard categories
      setSelectedCategories((prevSelected) => {
        const isSelected = prevSelected.includes(categoryValue);
        if (isSelected) {
          return prevSelected.filter((c) => c !== categoryValue);
        } else {
          return [...prevSelected, categoryValue];
        }
      });
      setCategoryInputSearch(''); // Clear search input after selection
      // Keep popover open for multi-select, or close if you prefer single select then re-open
      // setOpenCategoryCombobox(false); // Uncomment to close after each selection
    }
  }, []);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.filter((c) => c !== categoryToRemove)
    );
    if (customCategoryValue === categoryToRemove) {
      setCustomCategoryValue('');
    }
  }, [customCategoryValue]);


  const onGenerateCourse = async () => {
    // Basic validation
    const finalCategory = formData.category.trim();
    if (!formData.name || !formData.chapters || formData.chapters <= 0 || !formData.difficulty || !finalCategory) {
      alert("Please fill in all required fields: Course Name, Chapters, Difficulty, and at least one Category.");
      return;
    }

    const courseId = uuidv4();
    try {
      setLoading(true);
      const result = await axios.post("/api/generate-course-layout", {
        ...formData,
        courseId,
      });
      router.push("/workspace/edit-course/" + result.data?.courseId);
    } catch (error) {
      console.error("Error generating course:", error);
      alert("Failed to generate course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="
        backdrop-blur-md bg-[var(--card)]/90 border border-[var(--border)] shadow-2xl
        rounded-2xl p-6 text-[var(--foreground)]
        w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto
      ">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-[var(--foreground)] mb-2">
            Generate New Course
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-6 mt-4 text-sm text-[var(--muted-foreground)]">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Course Name</label>
                <Input
                  placeholder="Enter course name, e.g., 'Introduction to Quantum Physics'"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Course Description (optional)</label>
                <Textarea
                  placeholder="Provide a brief description of what the course will cover."
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                />
              </div>

              {/* Number of Chapters - Dropdown with "Other" input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Number of Chapters</label>
                <Select onValueChange={(value) => {
                  setSelectedChapterOption(value);
                  if (value !== 'other') {
                    setCustomChapters('');
                  }
                }} value={selectedChapterOption} required>
                  <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                    <SelectValue placeholder="Select number of chapters" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                    {CHAPTER_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="other"
                      className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                    >
                      Other (Enter Manually)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {selectedChapterOption === 'other' && (
                  <Input
                    type="number"
                    placeholder="Enter custom number of chapters"
                    value={customChapters}
                    onChange={(e) => setCustomChapters(e.target.value)}
                    className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    min="1"
                    required
                  />
                )}
              </div>

              {/* Include Video Lessons - Switch with improved neutral state */}
              <div className="flex items-center justify-between py-2">
                <label className="font-medium text-[var(--foreground)]">Include video lessons?</label>
                <Switch
                  checked={formData.includeVideo}
                  onCheckedChange={(checked) => handleInputChange("includeVideo", checked)}
                  className="data-[state=unchecked]:bg-[var(--muted-foreground)] data-[state=checked]:bg-[var(--primary)]"
                />
              </div>

              {/* Difficulty Level */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Difficulty Level</label>
                <Select onValueChange={(val) => handleInputChange("difficulty", val)} required>
                  <SelectTrigger className="w-full bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)]">
                    <SelectItem value="beginner" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category - Searchable Combobox with Multi-Select and "Other" input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-[var(--foreground)]">Category (select multiple or type custom)</label>
                <Popover open={openCategoryCombobox} onOpenChange={setOpenCategoryCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCategoryCombobox}
                      className="w-full justify-between bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--input)]/80 focus:ring-[var(--ring)] focus:border-[var(--primary)] min-h-[40px] flex-wrap h-auto" // Added min-h and flex-wrap
                    >
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.length > 0 ? (
                          selectedCategories.map((category) => (
                            <span
                              key={category}
                              className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs"
                            >
                              {category}
                              <XCircle
                                className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent popover from closing
                                  handleRemoveCategory(category);
                                }}
                              />
                            </span>
                          ))
                        ) : customCategoryValue.trim() ? (
                          <span className="flex items-center gap-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full px-2 py-0.5 text-xs">
                            {customCategoryValue} (Custom)
                            <XCircle
                              className="w-3 h-3 cursor-pointer hover:text-[var(--destructive)]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomCategoryValue('');
                              }}
                            />
                          </span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">Select category(s)...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[var(--popover)] border-[var(--border)] text-[var(--popover-foreground)] max-h-60 overflow-y-auto">
                    <Command className="bg-[var(--popover)]">
                      <CommandInput
                        placeholder="Search category..."
                        value={categoryInputSearch}
                        onValueChange={setCategoryInputSearch}
                        className="h-9 bg-[var(--input)] border-b border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                      />
                      <CommandEmpty className="py-4 text-center text-[var(--muted-foreground)]">No category found.</CommandEmpty>
                      <CommandGroup>
                        {CATEGORIES.filter(category =>
                          category.toLowerCase().includes(categoryInputSearch.toLowerCase())
                        ).map((category) => (
                          <CommandItem
                            key={category}
                            value={category}
                            onSelect={() => handleCategorySelect(category)} // Use new handler
                            className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategories.includes(category) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category}
                          </CommandItem>
                        ))}
                        <CommandItem
                          value="Other"
                          onSelect={() => handleCategorySelect("Other")} // Use new handler
                          className="hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] cursor-pointer font-semibold text-[var(--primary)]"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customCategoryValue.trim() ? "opacity-100" : "opacity-0" // Check if custom value exists
                            )}
                          />
                          Other (Enter Manually)
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {/* Custom Category Input (always visible if "Other" is selected, or if a custom value exists) */}
                {selectedCategories.length === 0 && ( // Only show custom input if no standard categories are selected
                  <Input
                    placeholder="Enter custom category"
                    value={customCategoryValue}
                    onChange={(e) => setCustomCategoryValue(e.target.value)}
                    className="mt-2 bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                    required={selectedCategories.length === 0} // Required if no standard categories are selected
                  />
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={onGenerateCourse}
                  disabled={loading || !formData.name || !formData.chapters || formData.chapters <= 0 || !formData.difficulty || (!selectedCategories.length && !customCategoryValue.trim())} // Updated validation
                  className="btn-primary gap-2 !text-base !h-12 !px-6"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkle className="w-5 h-5" />
                  )}
                  {loading ? "Generating..." : "Generate Course"}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddCourseDialog;
