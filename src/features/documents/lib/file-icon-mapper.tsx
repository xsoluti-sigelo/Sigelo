import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from 'react-icons/fa'
import { getFileExtension } from './document-utils'

export function getFileIcon(fileName: string, className?: string) {
  const extension = getFileExtension(fileName)
  const iconClassName = className || 'w-10 h-10'

  switch (extension) {
    case 'pdf':
      return <FaFilePdf className={`${iconClassName} text-red-500`} />

    case 'doc':
    case 'docx':
      return <FaFileWord className={`${iconClassName} text-blue-600`} />

    case 'xls':
    case 'xlsx':
      return <FaFileExcel className={`${iconClassName} text-green-600`} />

    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return <FaFileImage className={`${iconClassName} text-purple-500`} />

    case 'zip':
    case 'rar':
    case '7z':
      return <FaFileArchive className={`${iconClassName} text-yellow-600`} />

    case 'xml':
    case 'json':
    case 'csv':
    case 'txt':
      return <FaFileCode className={`${iconClassName} text-gray-600`} />

    default:
      return <FaFileAlt className={`${iconClassName} text-gray-400`} />
  }
}
