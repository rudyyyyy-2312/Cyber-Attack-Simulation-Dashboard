// ============================================================
// Analyzer.h  —  Cyber Defense Command Center
// C++ OOP: Threat analysis, packet inspection, severity scoring
// ============================================================
#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <cstdint>

// ── Enums ────────────────────────────────────────────────────
enum class Severity { LOW = 1, MEDIUM = 2, HIGH = 3, CRITICAL = 4 };
enum class ThreatType {
  SQL_INJECTION, DDOS, BRUTE_FORCE, PORT_SCAN,
  RANSOMWARE, XSS, MITM, ZERO_DAY, BOTNET, DNS_SPOOF, UNKNOWN
};

// ── Packet ───────────────────────────────────────────────────
struct Packet {
  std::string  src_ip;
  std::string  dst_ip;
  uint16_t     src_port;
  uint16_t     dst_port;
  std::string  protocol;   // "TCP" | "UDP" | "ICMP"
  std::string  payload;
  uint32_t     size_bytes;
  int64_t      timestamp_ms;
};

// ── ThreatEvent ──────────────────────────────────────────────
struct ThreatEvent {
  std::string  ip;
  std::string  type_str;
  ThreatType   type;
  Severity     severity;
  std::string  country;
  std::string  timestamp;
  int          score;        // 0-100

  // For priority_queue ordering (higher score = higher priority)
  bool operator<(const ThreatEvent& o) const { return score < o.score; }
};

// ── Analyzer class ───────────────────────────────────────────
class Analyzer {
public:
  Analyzer();

  // Inspect a raw packet and return a ThreatEvent (or nullopt if benign)
  ThreatEvent  analyzePacket(const Packet& pkt);

  // Check if an IP is on the blacklist
  bool         isBlacklisted(const std::string& ip) const;

  // Add IP to dynamic blacklist
  void         blacklistIP(const std::string& ip);

  // Calculate severity score 0-100
  int          calcScore(const Packet& pkt, ThreatType type) const;

  // Convert enum to string
  static std::string severityStr(Severity s);
  static std::string threatStr(ThreatType t);

private:
  std::unordered_map<std::string, bool>  m_blacklist;
  std::vector<std::string>               m_sorted_blacklist; // for binary search

  ThreatType   detectThreatType(const Packet& pkt) const;
  double       payloadEntropy(const std::string& payload) const;
};
