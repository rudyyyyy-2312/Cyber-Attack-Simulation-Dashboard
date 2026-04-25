// ============================================================
// Simulator.cpp  —  Cyber Defense Command Center
// Generates simulated attack_data.json for the frontend
// Compile:  g++ Simulator.cpp Analyzer.cpp -o cdcc_sim -std=c++17
// Run:      ./cdcc_sim          (creates attack_data.json)
// ============================================================
#include "Analyzer.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <queue>
#include <random>
#include <thread>
#include <chrono>

// ── Random helpers ────────────────────────────────────────────
static std::mt19937 rng(std::random_device{}());

template<typename T>
T randChoice(const std::vector<T>& v) {
  return v[std::uniform_int_distribution<size_t>(0, v.size()-1)(rng)];
}
int randInt(int lo, int hi) {
  return std::uniform_int_distribution<int>(lo, hi)(rng);
}

// ── Fake packet generator ─────────────────────────────────────
static const std::vector<std::string> FAKE_IPS = {
  "185.220.101.47","194.165.16.11","45.33.32.156","92.118.160.12",
  "103.21.244.0","77.247.181.165","199.87.154.255","185.100.87.41",
  "172.16.0.1","10.0.0.254","8.8.8.8","1.1.1.1"
};
static const std::vector<std::string> PROTOCOLS = {"TCP","UDP","ICMP"};
static const std::vector<std::string> PAYLOADS  = {
  "SELECT * FROM users WHERE id=1 UNION SELECT NULL--",
  "<script>alert(document.cookie)</script>",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // buffer overflow attempt
  "GET /admin HTTP/1.1\r\nHost: target.com",
  "\x90\x90\x90\x90\xeb\x0c",              // NOP sled shellcode
  "normal benign traffic data",
  "javascript:eval(atob('YWxlcnQoMSk='))",
};
static const std::vector<std::string> COUNTRIES = {
  "Russia","China","Iran","N.Korea","Brazil","Ukraine",
  "Germany","France","India","USA","Turkey","Indonesia"
};

Packet generatePacket() {
  return Packet{
    randChoice(FAKE_IPS),
    "192.168.1." + std::to_string(randInt(1,254)),
    (uint16_t)randInt(1024, 65535),
    (uint16_t)randChoice(std::vector<int>{22,80,443,3306,3389,53,8080}),
    randChoice(PROTOCOLS),
    randChoice(PAYLOADS),
    (uint32_t)randInt(40, 65535),
    std::chrono::duration_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now().time_since_epoch()).count()
  };
}

// ── JSON escaping ─────────────────────────────────────────────
std::string jsonEscape(const std::string& s) {
  std::string out;
  for (char c : s) {
    if      (c == '"')  out += "\\\"";
    else if (c == '\\') out += "\\\\";
    else if (c == '\n') out += "\\n";
    else if (c == '\r') out += "\\r";
    else                out += c;
  }
  return out;
}

// ── Write JSON ────────────────────────────────────────────────
void writeJSON(const std::vector<ThreatEvent>& events,
               const std::string& filename) {
  std::ofstream f(filename);
  if (!f) { std::cerr << "Cannot open " << filename << "\n"; return; }

  f << "{\n  \"generated\": " << time(nullptr) << ",\n";
  f << "  \"total\": " << events.size() << ",\n";
  f << "  \"events\": [\n";

  for (size_t i = 0; i < events.size(); i++) {
    const auto& e = events[i];
    f << "    {\n";
    f << "      \"ip\": \""       << jsonEscape(e.ip)       << "\",\n";
    f << "      \"type\": \""     << jsonEscape(e.type_str) << "\",\n";
    f << "      \"severity\": \"" << Analyzer::severityStr(e.severity) << "\",\n";
    f << "      \"country\": \""  << jsonEscape(e.country)  << "\",\n";
    f << "      \"timestamp\": \""<< jsonEscape(e.timestamp)<< "\",\n";
    f << "      \"score\": "      << e.score                << "\n";
    f << "    }" << (i + 1 < events.size() ? "," : "") << "\n";
  }
  f << "  ]\n}\n";
  f.close();
  std::cout << "[+] Written " << events.size() << " events to " << filename << "\n";
}

// ── Priority Queue simulation ─────────────────────────────────
void runSimulation(int count = 50) {
  Analyzer analyzer;
  // Max-heap (highest score first)
  std::priority_queue<ThreatEvent> threatQueue;
  std::vector<ThreatEvent> results;

  std::cout << "====================================\n";
  std::cout << " CDCC Threat Simulation Engine v1.0\n";
  std::cout << "====================================\n\n";

  for (int i = 0; i < count; i++) {
    Packet pkt = generatePacket();
    ThreatEvent ev = analyzer.analyzePacket(pkt);
    ev.country = randChoice(COUNTRIES);

    // Auto-blacklist critical threats
    if (ev.severity == Severity::CRITICAL) {
      analyzer.blacklistIP(ev.ip);
      std::cout << "[!] CRITICAL — " << ev.ip << " — " << ev.type_str
                << " (score=" << ev.score << ")\n";
    }

    threatQueue.push(ev);
    // Simulate async arrival
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }

  // Drain queue into results (highest score first)
  while (!threatQueue.empty()) {
    results.push_back(threatQueue.top());
    threatQueue.pop();
  }

  std::cout << "\n[+] Simulation complete. Total events: " << results.size() << "\n";
  writeJSON(results, "../attack_data.json");
}

// ── Entry point ───────────────────────────────────────────────
int main(int argc, char* argv[]) {
  int count = (argc > 1) ? std::stoi(argv[1]) : 50;
  runSimulation(count);
  return 0;
}
