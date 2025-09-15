import React from 'react'
import { FaFolder } from 'react-icons/fa'
import File from './File';

const Folder = ({ f, i, activeFolder, activeFile, handleOpenFile }) => {
    return (
        <>

            <div
                key={i}
                onClick={() => { handleOpenFile(f); }}
                className={`flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-[#333] ${activeFolder === f.path ? "bg-[#444]" : ""
                    }`}
            >
                <FaFolder color='skyblue' />
                {f.name}
            </div>
            {
                activeFolder && activeFolder.children.map((child, index) => (
                    child.type === "file" ? (
                        <File key={child.path} f={child} i={index} activeFile={activeFile} handleOpenFile={handleOpenFile} />
                    ) : (
                        <Folder key={child.path} f={child} i={index} activeFolder={activeFolder} activeFile={activeFile} handleOpenFile={handleOpenFile} />
                    )
                ))}

        </>
    )
}

export default Folder