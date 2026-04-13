import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Code2, 
  MessageSquare, 
  Trophy, 
  ExternalLink,
  Terminal,
  Cpu,
  Zap,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { getBuilderAdvice } from "@/services/geminiService";
import { APP_BUILDER_CODE, generateBuilderCode, appendBuilderCode } from "@/lib/builder-codes";

const CONTRACT_ADDRESS = "0x5bbF5eCb2cbE75128A30226a2D431e73c2BE054b";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "checkIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getProfile",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "total",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "last",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "streak",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getLevel",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_newStatus",
        "type": "string"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function App() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm your Base Builder Assistant. How can I help you build on Base today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [customAppId, setCustomAppId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // Contract Read Hooks
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProfile',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  const { data: levelData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLevel',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Contract Write Hooks
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetchProfile();
    }
  }, [isConfirmed, refetchProfile]);

  const handleCheckIn = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      // In a real app with builder codes, we'd use a custom hook or viem client 
      // to append the builder code to the transaction data.
      // For this demo, we'll call the standard writeContract.
      (writeContract as any)({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'checkIn',
      });
    } catch (error) {
      console.error("Check-in error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    const response = await getBuilderAdvice(chatInput);
    setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
    setIsTyping(false);
  };

  const handleGenerateCode = () => {
    if (!customAppId.trim()) return;
    setGeneratedCode(generateBuilderCode(customAppId));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">BASE BUILDER HUB</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">v1.0.4-stable</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectKitButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-12">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="codes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                <Code2 className="w-4 h-4" /> Builder Codes
              </TabsTrigger>
              <TabsTrigger value="assistant" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                <MessageSquare className="w-4 h-4" /> AI Assistant
              </TabsTrigger>
              <TabsTrigger value="quests" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-2 px-6">
                <Trophy className="w-4 h-4" /> Quests
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="dashboard" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Daily Check-in Card */}
                  <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 col-span-1 md:col-span-3 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400 w-6 h-6" /> Daily Builder Check-in
                          </CardTitle>
                          <CardDescription className="text-blue-200/60">
                            Maintain your streak and earn XP. Only pay for gas on Base.
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-500 text-white border-none px-3 py-1">
                          {profileData ? `+${10 + (Number(profileData[2]) * 2)} XP` : "+10 XP"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="relative flex flex-col sm:flex-row items-center justify-between gap-6 pb-8">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                          const streak = profileData ? Number(profileData[2]) : 0;
                          const isCompleted = day <= streak;
                          const isCurrent = day === streak + 1;
                          
                          return (
                            <div 
                              key={day} 
                              className={`w-10 h-12 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                isCompleted 
                                  ? "bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                  : isCurrent
                                    ? "bg-blue-600/20 border-blue-500/50 animate-pulse"
                                    : "bg-white/5 border-white/10 opacity-50"
                              }`}
                            >
                              <span className="text-[10px] font-mono uppercase opacity-60">Day</span>
                              <span className="font-bold">{day}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <Button 
                          size="lg" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 rounded-2xl shadow-lg shadow-blue-600/20 w-full sm:w-auto font-bold text-lg disabled:opacity-50"
                          onClick={handleCheckIn}
                          disabled={isConfirming || (profileData && (Date.now() / 1000) < Number(profileData[1]) + 86400)}
                        >
                          {isConfirming ? "Confirming..." : "Check-in Now"}
                        </Button>
                        <p className="text-[10px] text-slate-500 font-mono text-center w-full">
                          {profileData && (Date.now() / 1000) < Number(profileData[1]) + 86400 
                            ? "NEXT CHECK-IN IN ~24H" 
                            : "ESTIMATED GAS: <0.00001 ETH"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Overview */}
                  <Card className="bg-white/5 border-white/10 col-span-1 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="text-yellow-500 w-5 h-5" /> Network Status
                      </CardTitle>
                      <CardDescription>Real-time metrics from Base Mainnet</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "TPS", value: "42.5", trend: "+12%" },
                        { label: "Gas Price", value: "0.01 Gwei", trend: "Stable" },
                        { label: "Active Builders", value: "12.4k", trend: "+5%" },
                        { label: "Total Value", value: "$2.1B", trend: "+2.4%" }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-xs text-slate-500 font-mono mb-1">{stat.label}</p>
                          <p className="text-xl font-bold">{stat.value}</p>
                          <p className="text-[10px] text-green-500 mt-1">{stat.trend}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Builder Profile */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle>Your Profile</CardTitle>
                      <CardDescription>Builder Identity</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold border-4 border-white/10">
                        {isConnected ? address?.slice(2, 4).toUpperCase() : "?"}
                      </div>
                      <div>
                        <h3 className="font-bold">{isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not Connected"}</h3>
                        <p className="text-xs text-slate-500">
                          {levelData ? `Level ${levelData} ${Number(levelData) === 4 ? 'Master' : Number(levelData) === 3 ? 'Expert' : Number(levelData) === 2 ? 'Advanced' : 'Novice'} Builder` : "Novice Builder"}
                        </p>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-500" 
                          style={{ width: profileData ? `${Math.min((Number(profileData[3]) / 1000) * 100, 100)}%` : "0%" }} 
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {profileData ? `${profileData[3]} / 1000 XP to Next Level` : "0 / 1000 XP"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="bg-white/5 border-white/10 col-span-1 md:col-span-3">
                    <CardHeader>
                      <CardTitle>Builder News</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          "Base Builder Codes are now live for all developers.",
                          "New Quest: Deploy a Smart Wallet compatible contract.",
                          "Base gas fees reduced by 50% following recent upgrade."
                        ].map((news, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="text-sm flex-1">{news}</p>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="codes" className="mt-0">
                <div className="max-w-3xl mx-auto space-y-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="text-blue-500" /> Builder Code Generator
                      </CardTitle>
                      <CardDescription>
                        Generate a unique 8-character hex code to attribute your app's transactions on Base.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">App Name / Identifier</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="e.g. my-awesome-dapp" 
                            className="bg-white/5 border-white/10"
                            value={customAppId}
                            onChange={(e) => setCustomAppId(e.target.value)}
                          />
                          <Button onClick={handleGenerateCode} className="bg-blue-600 hover:bg-blue-700">Generate</Button>
                        </div>
                      </div>

                      {generatedCode && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Your Builder Code</span>
                            <Badge variant="outline" className="text-blue-400 border-blue-400/30">ERC-8021 Compatible</Badge>
                          </div>
                          <div className="text-4xl font-mono font-bold text-center tracking-widest text-white">
                            {generatedCode}
                          </div>
                          <div className="pt-4 border-t border-blue-500/10">
                            <p className="text-xs text-slate-400 mb-2">Wagmi / Viem Integration Snippet:</p>
                            <pre className="bg-black/40 p-3 rounded-lg text-[10px] font-mono text-blue-300 overflow-x-auto">
{`const dataWithCode = \`\${originalData}\${"${generatedCode}"}\`;
await sendTransaction({ data: dataWithCode, ... });`}
                            </pre>
                          </div>
                        </motion.div>
                      )}

                      <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <p className="text-xs text-yellow-200/70 leading-relaxed">
                          <strong>Note:</strong> Builder codes allow Base to track which apps are driving activity. 
                          This attribution is essential for potential builder rewards and ecosystem analytics.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="assistant" className="mt-0">
                <Card className="bg-white/5 border-white/10 h-[600px] flex flex-col">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="text-purple-500" /> Builder Assistant
                    </CardTitle>
                    <CardDescription>Powered by Gemini 2.0 Flash</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-4">
                        {chatHistory.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white/10 text-slate-200 rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none">
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-white/5 flex gap-2">
                      <Input 
                        placeholder="Ask about Base, Smart Wallets, or Builder Codes..." 
                        className="bg-white/5 border-white/10"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quests" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Hello Base", desc: "Connect your wallet to the Base network for the first time.", reward: "50 XP", icon: Zap },
                    { title: "Code Master", desc: "Generate your first Builder Code for an application.", reward: "100 XP", icon: Code2 },
                    { title: "Smart Minter", desc: "Deploy a basic NFT contract on Base Sepolia.", reward: "250 XP", icon: Terminal },
                    { title: "Gas Saver", desc: "Execute a transaction with optimized gas settings.", reward: "150 XP", icon: Zap },
                    { title: "AI Scholar", desc: "Ask the Builder Assistant 5 technical questions.", reward: "100 XP", icon: MessageSquare },
                    { title: "Mainnet Hero", desc: "Bridge at least 0.001 ETH to Base Mainnet.", reward: "500 XP", icon: Trophy }
                  ].map((quest, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all group cursor-pointer">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <quest.icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <CardTitle className="text-lg">{quest.title}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed">{quest.desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-none">{quest.reward}</Badge>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 group-hover:text-blue-400">
                          Start <ChevronRight className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Cpu className="w-5 h-5" />
            <span className="font-bold tracking-tight">BASE BUILDER HUB</span>
          </div>
          
          <div className="flex gap-8 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="#" className="hover:text-white transition-colors">Base.org</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono">APP_ID: {APP_BUILDER_CODE}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
