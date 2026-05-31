/**
 * Toolkit — reusable, self-contained tool UI components.
 *
 * Import from the barrel:
 *   import { QRCodeGenerator, ColorPicker } from '@/components/toolkit';
 *
 * Every component is a client component, works in light & dark mode, and
 * accepts typed props (exported alongside each component).
 */

export { DragDropUpload, type DragDropUploadProps } from './DragDropUpload';
export { CompareSlider, type CompareSliderProps } from './CompareSlider';
export { CodeBlock, type CodeBlockProps } from './CodeBlock';
export { JsonTreeViewer, type JsonTreeViewerProps } from './JsonTreeViewer';
export { ColorPicker, type ColorPickerProps } from './ColorPicker';
export { Base64Converter, type Base64ConverterProps } from './Base64Converter';
export { QRCodeGenerator, type QRCodeGeneratorProps } from './QRCodeGenerator';
export {
  PasswordStrengthMeter,
  type PasswordStrengthMeterProps,
} from './PasswordStrengthMeter';
export { DiffViewer, type DiffViewerProps } from './DiffViewer';
export { LoremGenerator, type LoremGeneratorProps } from './LoremGenerator';
export { UuidGenerator, type UuidGeneratorProps } from './UuidGenerator';
export {
  UnitConverter,
  type Category as UnitCategory,
  type Unit as UnitDefinition,
} from './UnitConverter';
export { StopwatchTimer, type StopwatchTimerProps } from './StopwatchTimer';
export { RegexTester, type RegexTesterProps } from './RegexTester';
export { UrlParser, type UrlParserProps } from './UrlParser';
export { MetaTagPreview, type MetaTagPreviewProps } from './MetaTagPreview';
export { SitemapGenerator, type SitemapGeneratorProps } from './SitemapGenerator';
export { RobotsTester, type RobotsTesterProps } from './RobotsTester';
export { HttpStatusChecker, type HttpStatusCheckerProps } from './HttpStatusChecker';
export { IpLookup, type IpLookupProps } from './IpLookup';
