import React from 'react'
import { FaFileAlt } from 'react-icons/fa'

const File = ({ f, i, activeFile, handleOpenFile }) => {
    return (
        <div
            key={i}
            onClick={() => { handleOpenFile(f); }}
            className={`flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[#333] ${activeFile === f.path ? "bg-[#444]" : ""
                }`}
        >
            <FaFileAlt />
            {f.name}
        </div>
    )
}

export default File