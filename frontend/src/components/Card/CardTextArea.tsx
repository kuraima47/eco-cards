import React, { useState } from "react";

const MAX_LINES = 8;
const MAX_CHARACTERS_PER_LINE = 44;

interface TextAreaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    otherText?: string;
}

const handleTextChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>, otherText: string | undefined) => {
    const lines = text.split("\n");
    const otherLines = otherText ? otherText.split("\n") : [];
    let lineCount = 0;

    // Compter les lignes en tenant compte du nombre maximal de caractères par ligne
    const countLines = (l: string[]) => {
        let count = 0;
        l.forEach(line => {
            count += Math.ceil((line.length / MAX_CHARACTERS_PER_LINE) === 0 ? 1 : line.length / MAX_CHARACTERS_PER_LINE);
        });
        return count;
    };

    lineCount += countLines(lines);
    lineCount += countLines(otherLines);

    const isTooManyLines = lineCount >= MAX_LINES+1;
    const isTextTooManyLines = countLines(lines) >= MAX_LINES - 1;

    if (!isTooManyLines && !isTextTooManyLines) {
        setter(text);
    }
};

const CardTextArea: React.FC<TextAreaProps> = ({ value, onChange, placeholder, className, otherText }) => {
    const [text, setText] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleTextChange(e.target.value, setText, otherText);
        onChange(e.target.value);
    };

    return (
        <textarea
            value={text}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            rows={3}
            style={{ resize: "none" }}
        />
    );
};

export default CardTextArea;  