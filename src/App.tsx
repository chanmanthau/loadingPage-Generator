import { useRef, useState } from "react";
import type React from "react";
import {
  Check,
  Download,
  FileImage,
  ImageIcon,
  Sparkles,
  Upload,
} from "lucide-react";
import buildHtmlStr from "../utils/generateHtml"

type AssetKey = "icon" | "btn" | "banner" | "title" | "word";
type Asset = { key: AssetKey; name: string; hint: string; image: string };

const getAssetKey = (filename: string): AssetKey => {
  const name = filename.toLowerCase();
  if (name.includes("icon")) return "icon";
  if (name.includes("btn")) return "btn";
  if (name.includes("img")) return "banner";
  if (name.includes("word")) return "word";
  return "title";
};


const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const assetDetails: Omit<Asset, "image">[] = [
  { key: "icon", name: "应用图标", hint: "文件名包含 icon" },
  { key: "btn", name: "按钮图片", hint: "文件名包含 btn" },
  { key: "banner", name: "横幅图片", hint: "文件名包含 img" },
  { key: "title", name: "标题图片", hint: "其余图片默认归类至此" },
  { key: "word", name: "文字图片", hint: "文件名包含 word" },
];

function App() {
  const [images, setImages] = useState<Record<AssetKey, string>>({
    icon: "",
    btn: "",
    banner: "",
    title: "",
    word: "",
  });
  const [htmlName, setHtmlName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const inputRef = useRef<HTMLInputElement>(null);
  const assets: Asset[] = assetDetails.map((asset) => ({
    ...asset,
    image: images[asset.key],
  }));
  const completedCount = assets.filter((asset) => asset.image).length;
  const progress = (completedCount / assets.length) * 100;

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    e.target.value = "";

    const titleFile = [...files]
      .reverse()
      .find((file) => getAssetKey(file.name) === "title");
    if (titleFile) {
      setHtmlName(titleFile.name.replace(/@2x\.png$/i, ""));
    }

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => ({
          key: getAssetKey(file.name),
          image: await readAsDataUrl(file),
        })),
      );

      setImages((current) => {
        const next = { ...current };
        uploadedImages.forEach(({ key, image }) => {
          next[key] = image;
        });
        return next;
      });
    } catch {
      window.alert("部分图片读取失败，请重新选择后上传。");
    }
  };

  const handleGenerateHtml = () => {
    if (completedCount !== assets.length) return;
    const safeBackgroundColor = /^#[0-9a-fA-F]{3,8}$/.test(backgroundColor.trim())
      ? backgroundColor.trim()
      : "#f8fafc";

    const html = buildHtmlStr(images.banner,images.icon,images.title,images.word,images.btn,"",safeBackgroundColor)

    const safeFileName = (htmlName.trim() || "mental-landing-page")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\.html$/i, "");
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName || "mental-landing-page"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="size-3.5" /> Mental落地页生成器
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              上传设计素材
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              根据文件名自动归类，完成全部素材后即可继续生成。
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              上传进度
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {completedCount}{" "}
              <span className="text-sm font-medium text-slate-400">
                / {assets.length} 已完成
              </span>
            </p>
          </div>
        </header>
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
                <Upload className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">添加图片</h2>
                <p className="text-sm text-slate-500">
                  支持 PNG、JPG、WEBP 等格式
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-7 flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-violet-300 hover:bg-violet-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <span className="rounded-full bg-white p-3 text-violet-600 shadow-sm">
                <ImageIcon className="size-6" />
              </span>
              <span className="mt-4 font-semibold text-slate-700">
                选择一张或多张图片
              </span>
              <span className="mt-1 text-sm text-slate-400">
                图片会依据文件名自动分配
              </span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUploadImage}
              className="hidden"
            />
            <div className="mt-7">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">完成度</span>
                <span className="font-semibold text-violet-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">素材任务</h2>
                <p className="mt-1 text-sm text-slate-500">
                  每上传一个文件，任务会自动完成。
                </p>
              </div>
              <FileImage className="size-5 text-slate-400" />
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2" role="list">
              {assets.map((asset) => {
                const completed = Boolean(asset.image);
                return (
                  <li
                    key={asset.key}
                    className="flex min-h-24 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    {completed ? (
                      <img
                        src={asset.image}
                        alt={`${asset.name}预览`}
                        className="size-14 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-xl bg-white text-slate-300">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">{asset.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {asset.hint}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${completed ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {completed && <Check className="size-3.5" />}
                        {completed ? "已完成" : "待上传"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="html-name" className="text-sm font-semibold text-slate-800">
              应用名称
            </label>
            <p className="mt-1 text-xs text-slate-500">下载时会自动添加 .html 后缀。</p>
            <input
              id="html-name"
              value={htmlName}
              onChange={(e) => setHtmlName(e.target.value)}
              placeholder="例如：Golden Reels Fantasy"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <div>
            <label htmlFor="background-color" className="text-sm font-semibold text-slate-800">
              背景颜色
            </label>
            <p className="mt-1 text-xs text-slate-500">填写 #FFFFFF 形式的颜色值。</p>
            <input
              id="background-color"
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#F8FAFC"
              spellCheck={false}
              className="mt-3 h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:w-36"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerateHtml}
          disabled={completedCount !== assets.length}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          <Download className="size-4" />
          {completedCount === assets.length
            ? "生成并下载 HTML"
            : `还需上传 ${assets.length - completedCount} 个素材`}
        </button>
      </div>
    </main>
  );
}

export default App;
