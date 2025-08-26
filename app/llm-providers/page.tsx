"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, Settings, Bot, Key, Eye, EyeOff } from "lucide-react";
import { useChat } from "ai/react";
import { toast } from "sonner";

interface Provider {
  provider: string;
  available: boolean;
  config: {
    models: string[];
    defaultModel: string;
    requiresApiKey: boolean;
    supportsStreaming: boolean;
    baseURL?: string;
  };
}

export default function MultiProviderChat() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      provider: selectedProvider,
      model: selectedModel,
      temperature: temperature,
    },
  });

  useEffect(() => {
    fetchProviders();
    loadApiKeysFromStorage();
  }, []);

  const loadApiKeysFromStorage = () => {
    const stored = localStorage.getItem('llm-api-keys');
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored API keys');
      }
    }
  };

  const saveApiKey = (provider: string, key: string) => {
    const newApiKeys = { ...apiKeys, [provider]: key };
    setApiKeys(newApiKeys);
    localStorage.setItem('llm-api-keys', JSON.stringify(newApiKeys));
    
    toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key has been configured.`);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/llm/providers?includeUnavailable=true');
      const data = await response.json();
      setProviders(data.providers);
      
      // Set default to first available provider
      const availableProvider = data.providers.find((p: Provider) => p.available);
      if (availableProvider) {
        setSelectedProvider(availableProvider.provider);
        setSelectedModel(availableProvider.config.defaultModel);
      }
    } catch (err) {
      setError('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const providerConfig = providers.find(p => p.provider === provider)?.config;
    if (providerConfig) {
      setSelectedModel(providerConfig.defaultModel);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading providers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Provider LLM Chat</h1>
        <p className="text-muted-foreground">
          Test and compare different LLM providers with our unified chat interface
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Provider Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Provider Settings
              </CardTitle>
              <CardDescription>
                Configure your LLM provider and model settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem 
                        key={provider.provider} 
                        value={provider.provider}
                        disabled={!provider.available}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{provider.provider}</span>
                          {provider.available ? (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProvider && (
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers
                        .find(p => p.provider === selectedProvider)
                        ?.config.models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="temperature">Temperature: {temperature}</Label>
                <Input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={clearMessages} 
                variant="outline" 
                className="w-full"
                disabled={messages.length === 0}
              >
                Clear Chat
              </Button>
            </CardContent>
          </Card>

          {/* Provider Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Provider Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {providers.map((provider) => (
                  <div key={provider.provider} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{provider.provider}</span>
                    <Badge 
                      variant={provider.available ? "default" : "secondary"}
                      className={provider.available ? "bg-green-500" : ""}
                    >
                      {provider.available ? "Available" : "Not Configured"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Key Configuration */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Key Configuration
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyConfig(!showApiKeyConfig)}
                >
                  {showApiKeyConfig ? "Hide" : "Configure"}
                </Button>
              </CardTitle>
              <CardDescription>
                Configure API keys for different LLM providers
              </CardDescription>
            </CardHeader>
            {showApiKeyConfig && (
              <CardContent className="space-y-4">
                {providers
                  .filter(p => p.config.requiresApiKey)
                  .map((provider) => (
                    <div key={provider.provider} className="space-y-2">
                      <Label htmlFor={`api-key-${provider.provider}`}>
                        {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)} API Key
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id={`api-key-${provider.provider}`}
                          type={showKeys[provider.provider] ? "text" : "password"}
                          placeholder={`Enter your ${provider.provider} API key`}
                          value={apiKeys[provider.provider] || ""}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.provider]: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyVisibility(provider.provider)}
                        >
                          {showKeys[provider.provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveApiKey(provider.provider, apiKeys[provider.provider] || "")}
                          disabled={!apiKeys[provider.provider]?.trim()}
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {provider.provider === 'openai' && 'Get your key from platform.openai.com'}
                        {provider.provider === 'anthropic' && 'Get your key from console.anthropic.com'}
                        {provider.provider === 'gemini' && 'Get your key from makersuite.google.com'}
                        {provider.provider === 'openrouter' && 'Get your key from openrouter.ai'}
                      </p>
                    </div>
                  ))}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm text-amber-700">
                      API keys are stored locally in your browser and are not sent to our servers.
                    </span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Chat with {selectedProvider ? selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1) : 'LLM'}
              </CardTitle>
              <CardDescription>
                {selectedModel && `Model: ${selectedModel}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start a conversation with your selected LLM provider
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-50 ml-8'
                          : 'bg-gray-50 mr-8'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {message.role === 'user' ? 'You' : selectedProvider || 'AI'}
                        </Badge>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px]"
                  disabled={!selectedProvider || isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={!selectedProvider || !input.trim() || isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}