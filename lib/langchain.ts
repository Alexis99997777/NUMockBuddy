import { OpenAIEmbeddings } from "@langchain/openai"; //文字 -> 向量 用openai model embedding model array -》 matrix
import { MemoryVectorStore } from "langchain/vectorstores/memory"; //存向量 + 相似度搜索
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // 长文档切成小块
import { Document } from "@langchain/core/documents";// langchain 的标准的一段文本类型
import fs from "fs"; // node 读文件
import path from "path"; // node 拼路径

let vectorStore: MemoryVectorStore | null = null;

//模块级缓存+ embedding 客户端
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: "text-embedding-3-small",
});

//feed the word into the model then get the vector back

//3.set and fetch vector store 建立/取向量数据库
//export 对外公用
export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (vectorStore) return vectorStore;

  //拼出项目根的目录
  //读出这个项目下的所有文件名
  //并且只保留.txt 和 .md的文件
  const kbDir = path.join(process.cwd(), "data", "knowledge-base");
  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith(".txt") || f.endsWith(".md"));

  //set a file splitter machine
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  //读文件的全文
  //切进n 个 document对象
  //全部塞进docs数组中
  const docs: Document[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(kbDir, file), "utf-8");
    const chunks = await splitter.createDocuments([content], [{ source: file }]);
    docs.push(...chunks);
  }
//for loop each files
// cut into N's document objects
// all insert into docs arrray

  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}
//把docs逐个掉openai api的接口转成 1536个向量
//把原文和向量全部塞入一个叫内存的数据结构

//search the method
//find 3 most similarity
export async function retrieveContext(query: string, k = 3): Promise<string> {
  //拿到首次建立向量库
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, k);
  return results.map((doc) => doc.pageContent).join("\n\n---\n\n");
}

//similarity search内部做的 把所有的similarity score算出来 再从高到低去进行排序


//拿到构建向量数据库
//把query算成向量数据库去里找最相似的3个文本块
//把这3个文本块拼成原文塞入 Claude prompt里面

//给jd和简历进行单独使用的
//jd关键词和简历关键词匹配
export async function semanticKeywordMatch(
  jdPhrases: string[],
  resumeText: string,
  threshold = 0.72
): Promise<{ phrase: string; matched: boolean; similarity: number }[]> {
  //把简历切成更细的块 200个字
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 200, chunkOverlap: 20 });
  const resumeChunks = await splitter.createDocuments([resumeText]);
  //给简历建立临时数据库
  const resumeStore = await MemoryVectorStore.fromDocuments(resumeChunks, embeddings);

  const results = [];
  for (const phrase of jdPhrases) {
    const similar = await resumeStore.similaritySearchWithScore(phrase, 1);
    const score = similar[0]?.[1] ?? 0;
    results.push({ phrase, matched: score >= threshold, similarity: score });
  }
  return results;
}

//创建一个数组 经验值采用的是0.72
//