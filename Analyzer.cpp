// ============================================================
// Analyzer.cpp  —  Cyber Defense Command Center
// ============================================================
#include "Analyzer.h"
#include <algorithm>
#include <cmath>
#include <map>
#include <chrono>
#include <iomanip>
#include <sstream>

// ── Constructor: seed known-bad IPs ──────────────────────────
Analyzer::Analyzer() {
  std::vector<std::string> known_bad = {
    "185.220.101.47","194.165.16.11","45.33.32.156",
    "92.118.160.12","103.21.244.0","77.247.181.165",
    "199.87.154.255","185.100.87.41","95.211.109.50"
  };
  for (auto& ip : known_bad) {
    m_blacklist[ip] = true;
    m_sorted_blacklist.push_back(ip);
  }
  std::sort(m_sorted_blacklist.begin(), m_sorted_blacklist.end());
}

// ── isBlacklisted: O(log n) binary search ────────────────────
bool Analyzer::isBlacklisted(const std::string& ip) const {
  // Fast hash lookup first
  if (m_blacklist.count(ip)) return true;
  // Binary search on sorted vector
  return std::binary_search(m_sorted_blacklist.begin(),
                             m_sorted_blacklist.end(), ip);
}

void Analyzer::blacklistIP(const std::string& ip) {
  m_blacklist[ip] = true;
  auto it = std::lower_bound(m_sorted_blacklist.begin(),
                             m_sorted_blacklist.end(), ip);
  if (it == m_sorted_blacklist.end() || *it != ip)
    m_sorted_blacklist.insert(it, ip);
}

// ── Payload entropy (Shannon) — high entropy = likely encrypted/packed
double Analyzer::payloadEntropy(const std::string& payload) const {
  if (payload.empty()) return 0.0;
  std::map<char, int> freq;
  for (char c : payload) freq[c]++;
  double entropy = 0.0;
  double len = static_cast<double>(payload.size());
  for (const auto& pair : freq) {
    double p = pair.second / len;
    entropy -= p * std::log2(p);
  }
  return entropy;
}

// ── Detect threat type from packet heuristics ────────────────
ThreatType Analyzer::detectThreatType(const Packet& pkt) const {
  const auto& pay = pkt.payload;

  // SQL injection keywords
  if (pay.find("SELECT") != std::string::npos ||
      pay.find("UNION")  != std::string::npos ||
      pay.find("DROP")   != std::string::npos)
    return ThreatType::SQL_INJECTION;

  // XSS
  if (pay.find("<script") != std::string::npos ||
      pay.find("javascript:") != std::string::npos)
    return ThreatType::XSS;

  // DDoS: ICMP flood or very large payload to same port repeatedly
  if (pkt.protocol == "ICMP" && pkt.size_bytes > 1000)
    return ThreatType::DDOS;

  // Brute force: repeated auth port
  if (pkt.dst_port == 22 || pkt.dst_port == 3389)
    return ThreatType::BRUTE_FORCE;

  // Port scan: small packets, many ports
  if (pkt.size_bytes < 64 && pkt.dst_port > 1024)
    return ThreatType::PORT_SCAN;

  // DNS spoofing
  if (pkt.dst_port == 53 && pkt.protocol == "UDP")
    return ThreatType::DNS_SPOOF;

  // High entropy payload = possible ransomware / C2
  if (payloadEntropy(pay) > 7.5)
    return ThreatType::RANSOMWARE;

  return ThreatType::UNKNOWN;
}

// ── Severity score 0-100 ─────────────────────────────────────
int Analyzer::calcScore(const Packet& pkt, ThreatType type) const {
  int score = 0;

  // Base score by type
  std::map<ThreatType, int> base = {
    {ThreatType::ZERO_DAY,      90},
    {ThreatType::RANSOMWARE,    80},
    {ThreatType::DDOS,          75},
    {ThreatType::MITM,          70},
    {ThreatType::BOTNET,        65},
    {ThreatType::SQL_INJECTION, 60},
    {ThreatType::BRUTE_FORCE,   50},
    {ThreatType::XSS,           45},
    {ThreatType::DNS_SPOOF,     55},
    {ThreatType::PORT_SCAN,     30},
    {ThreatType::UNKNOWN,       20},
  };
  score = base.count(type) ? base.at(type) : 20;

  // Bonus: known bad IP
  if (isBlacklisted(pkt.src_ip)) score += 15;

  // Bonus: high payload entropy
  double ent = payloadEntropy(pkt.payload);
  if (ent > 7.0) score += 10;
  else if (ent > 5.0) score += 5;

  // Bonus: large packet
  if (pkt.size_bytes > 65000) score += 5;

  return std::min(score, 100);
}

// ── Main analysis entry point ─────────────────────────────────
ThreatEvent Analyzer::analyzePacket(const Packet& pkt) {
  ThreatType type  = detectThreatType(pkt);
  int        score = calcScore(pkt, type);

  Severity sev;
  if      (score >= 80) sev = Severity::CRITICAL;
  else if (score >= 60) sev = Severity::HIGH;
  else if (score >= 40) sev = Severity::MEDIUM;
  else                  sev = Severity::LOW;

  // Timestamp
  auto now = std::chrono::system_clock::now();
  auto t   = std::chrono::system_clock::to_time_t(now);
  std::ostringstream ts;
  ts << std::put_time(std::gmtime(&t), "%H:%M:%S");

  return ThreatEvent{
    pkt.src_ip, threatStr(type), type,
    sev, "Unknown", ts.str(), score
  };
}

// ── String helpers ────────────────────────────────────────────
std::string Analyzer::severityStr(Severity s) {
  switch (s) {
    case Severity::CRITICAL: return "CRITICAL";
    case Severity::HIGH:     return "HIGH";
    case Severity::MEDIUM:   return "MEDIUM";
    case Severity::LOW:      return "LOW";
  }
  return "UNKNOWN";
}

std::string Analyzer::threatStr(ThreatType t) {
  switch (t) {
    case ThreatType::SQL_INJECTION: return "SQL Injection";
    case ThreatType::DDOS:          return "DDoS Attack";
    case ThreatType::BRUTE_FORCE:   return "Brute Force";
    case ThreatType::PORT_SCAN:     return "Port Scan";
    case ThreatType::RANSOMWARE:    return "Ransomware";
    case ThreatType::XSS:           return "XSS Attack";
    case ThreatType::MITM:          return "MITM Attack";
    case ThreatType::ZERO_DAY:      return "Zero-Day Exploit";
    case ThreatType::BOTNET:        return "Botnet C&C";
    case ThreatType::DNS_SPOOF:     return "DNS Spoofing";
    case ThreatType::UNKNOWN:       return "Unknown Threat";
  }
  return "Unknown";
}
