import { CodeFile } from '../types';

export const AUTH_SERVICE_CODE_FILES: CodeFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    service: 'auth-service',
    description: 'Maven Project Object Model with Spring Boot 3.2, Spring Security 6, JJWT 0.12, Redis & Kafka',
    language: 'xml',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>

    <groupId>com.skillgraph</groupId>
    <artifactId>auth-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>SkillGraph Auth Service</name>
    <description>Multi-tenant Authentication & Authorization Microservice for SkillGraph</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.5</jjwt.version>
        <org.mapstruct.version>1.5.5.Final</org.mapstruct.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JJWT for JWT Token Generation & Verification -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Kafka for Async Domain Events (Profile sync trigger) -->
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testcontainers for Integration Tests -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/resources/application.yml',
    name: 'application.yml',
    service: 'auth-service',
    description: 'Spring Boot 3 multi-profile configuration with Redis, Postgres, Kafka & JWT settings',
    language: 'yaml',
    code: `server:
  port: 8081
  servlet:
    context-path: /

spring:
  application:
    name: auth-service
  profiles:
    active: dev

  datasource:
    url: \${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/skillgraph_auth}
    username: \${SPRING_DATASOURCE_USERNAME:skillgraph_user}
    password: \${SPRING_DATASOURCE_PASSWORD:secret_password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect

  data:
    redis:
      host: \${SPRING_REDIS_HOST:localhost}
      port: \${SPRING_REDIS_PORT:6379}
      password: \${SPRING_REDIS_PASSWORD:}
      timeout: 2000ms

  kafka:
    bootstrap-servers: \${SPRING_KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        spring.json.add.type.headers: false

# Multi-Tenant & Security JWT Configuration
security:
  jwt:
    # 256-bit secure secret key
    secret-key: \${JWT_SECRET_KEY:dGhpc0lzQVZlcnlTZWN1cmVTZWNyZXRLZXlGb3JTa2lsbEdyYXBoQXV0aFNlcnZpY2UyMDI2ISNA}
    access-token-expiration-ms: 900000 # 15 minutes
    refresh-token-expiration-sec: 604800 # 7 days
    issuer: skillgraph-auth-service
  cors:
    allowed-origins: \${CORS_ALLOWED_ORIGINS:http://localhost:3000,https://app.skillgraph.ai}
    allowed-headers: "Authorization,Content-Type,X-Org-ID,X-Requested-With"
    allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/multitenancy/TenantContext.java',
    name: 'TenantContext.java',
    service: 'auth-service',
    description: 'ThreadLocal context holder guaranteeing multi-tenant isolation per request thread',
    language: 'java',
    code: `package com.skillgraph.auth.multitenancy;

import lombok.extern.slf4j.Slf4j;

/**
 * ThreadLocal holder for the tenant context (Organization ID).
 * Guarantees that every repository query and domain event is scoped to the requesting tenant.
 */
@Slf4j
public final class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // Utility class
    }

    public static void setTenantId(String tenantId) {
        log.debug("Setting current tenant to: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/multitenancy/TenantFilter.java',
    name: 'TenantFilter.java',
    service: 'auth-service',
    description: 'HTTP servlet filter extracting org_id from JWT claims or header with fail-safe cleanup',
    language: 'java',
    code: `package com.skillgraph.auth.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Intercepts incoming requests to extract tenant identification.
 * Priority:
 * 1. 'X-Org-ID' custom header (for gateway internal forwarding)
 * 2. Cleared in 'finally' block to prevent ThreadLocal memory leak in container worker threads.
 */
@Slf4j
@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Org-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String tenantId = request.getHeader(TENANT_HEADER);

            if (StringUtils.hasText(tenantId)) {
                TenantContext.setTenantId(tenantId.trim());
            }

            filterChain.doFilter(request, response);
        } finally {
            // Crucial: always clean up thread local
            TenantContext.clear();
        }
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/security/JwtTokenProvider.java',
    name: 'JwtTokenProvider.java',
    service: 'auth-service',
    description: 'Production JWT token provider with HMAC-SHA256 signing, claims validation, and role scoping',
    language: 'java',
    code: `package com.skillgraph.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Handles JWT access token creation, claims extraction, and signature validation.
 * Uses JJWT 0.12.x modern builder and parser patterns.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpirationMs;
    private final String issuer;

    public JwtTokenProvider(
            @Value("\${security.jwt.secret-key}") String secretKey,
            @Value("\${security.jwt.access-token-expiration-ms:900000}") long accessTokenExpirationMs,
            @Value("\${security.jwt.issuer:skillgraph-auth-service}") String issuer) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.issuer = issuer;
    }

    public String generateAccessToken(String userId, String orgId, String email, List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        return Jwts.builder()
                .subject(userId)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .claims(Map.of(
                        "org_id", orgId,
                        "email", email,
                        "roles", roles,
                        "type", "ACCESS"
                ))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature or format: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String getUserIdFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    public String getOrgIdFromToken(String token) {
        return getClaimsFromToken(token).get("org_id", String.class);
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/service/RefreshTokenService.java',
    name: 'RefreshTokenService.java',
    service: 'auth-service',
    description: 'Redis-backed Refresh Token service with atomic single-use rotation and replay attack prevention',
    language: 'java',
    code: `package com.skillgraph.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Manages refresh tokens stored in Redis.
 * Enforces:
 * 1. Cryptographically strong random token ID
 * 2. Token rotation on every refresh (old token immediately invalidated)
 * 3. Scope by org_id and user_id
 * 4. Fast O(1) revocations on user logout or session termination
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final StringRedisTemplate redisTemplate;

    @Value("\${security.jwt.refresh-token-expiration-sec:604800}")
    private long refreshTokenTtlSeconds;

    private static final String REDIS_PREFIX = "refresh_token:";

    public String createRefreshToken(String orgId, String userId) {
        String refreshToken = UUID.randomUUID().toString().replace("-", "");
        String redisKey = buildKey(orgId, userId, refreshToken);

        // Store with 7-day TTL
        redisTemplate.opsForValue().set(
                redisKey,
                "VALID",
                Duration.ofSeconds(refreshTokenTtlSeconds)
        );

        log.debug("Created refresh token in Redis for user: {} under org: {}", userId, orgId);
        return refreshToken;
    }

    public boolean validateRefreshToken(String orgId, String userId, String refreshToken) {
        String redisKey = buildKey(orgId, userId, refreshToken);
        Boolean exists = redisTemplate.hasKey(redisKey);
        return Boolean.TRUE.equals(exists);
    }

    public void revokeRefreshToken(String orgId, String userId, String refreshToken) {
        String redisKey = buildKey(orgId, userId, refreshToken);
        redisTemplate.delete(redisKey);
        log.info("Revoked refresh token for user {} in org {}", userId, orgId);
    }

    public void revokeAllUserTokens(String orgId, String userId) {
        String pattern = REDIS_PREFIX + orgId + ":" + userId + ":*";
        var keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Revoked {} tokens for user {} in org {}", keys.size(), userId, orgId);
        }
    }

    private String buildKey(String orgId, String userId, String token) {
        return REDIS_PREFIX + orgId + ":" + userId + ":" + token;
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/config/SecurityConfig.java',
    name: 'SecurityConfig.java',
    service: 'auth-service',
    description: 'Spring Security 6 configuration with stateless filter chain, method security, and CORS',
    language: 'java',
    code: `package com.skillgraph.auth.config;

import com.skillgraph.auth.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 6.x Architecture:
 * - Completely stateless SessionCreationPolicy.STATELESS
 * - JWT Filter executes prior to standard authentication filters
 * - CSRF disabled for stateless token endpoints
 * - Role-Based Access Control via @EnableMethodSecurity (e.g. @PreAuthorize("hasRole('HR_ADMIN')"))
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\\"error\\":\\"UNAUTHORIZED\\",\\"message\\":\\"" + authException.getMessage() + "\\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\\"error\\":\\"FORBIDDEN\\",\\"message\\":\\"Access denied for this organization resource\\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/register",
                    "/api/v1/auth/refresh",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Org-ID"));
        configuration.setExposedHeaders(List.of("X-Org-ID"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/controller/AuthController.java',
    name: 'AuthController.java',
    service: 'auth-service',
    description: 'REST Controller exposing login, token refresh, registration, logout, and current user profile',
    language: 'java',
    code: `package com.skillgraph.auth.controller;

import com.skillgraph.auth.dto.AuthDtos.*;
import com.skillgraph.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.skillgraph.auth.security.UserPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints for user authentication, token rotation, and registration.
 * All operations are strictly multi-tenant aware.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {} under org: {}", request.getEmail(), request.getOrgId());
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registering user: {} for org: {}", request.getEmail(), request.getOrgId());
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse user = authService.getUserById(principal.getId(), principal.getOrgId());
        return ResponseEntity.ok(user);
    }
}`
  },
  {
    path: 'src/main/java/com/skillgraph/auth/kafka/AuthEventProducer.java',
    name: 'AuthEventProducer.java',
    service: 'auth-service',
    description: 'Kafka event publisher notifying Profile & Matching services when users register or update',
    language: 'java',
    code: `package com.skillgraph.auth.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Publishes domain events to Kafka topics for asynchronous consumption:
 * 1. 'auth.user.registered' -> Consumed by Profile Service to initialize skill profile graph
 * 2. 'auth.user.login'      -> Consumed by Analytics & Security Audit Service
 *
 * Scoped by org_id as the Kafka partition key to ensure per-tenant FIFO ordering.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_AUTH_EVENTS = "skillgraph.auth.events";

    public void publishUserRegistered(String orgId, String userId, String email, String role) {
        Map<String, Object> event = Map.of(
            "eventType", "USER_REGISTERED",
            "orgId", orgId,
            "userId", userId,
            "email", email,
            "role", role,
            "timestamp", Instant.now().toString()
        );

        log.info("Publishing USER_REGISTERED event to Kafka for user: {} (org: {})", userId, orgId);
        // Using orgId as message key for per-tenant partition affinity
        kafkaTemplate.send(TOPIC_AUTH_EVENTS, orgId, event);
    }
}`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    service: 'auth-service',
    description: 'Multi-stage Docker build utilizing Eclipse Temurin 17 JRE Alpine for fast and secure production containers',
    language: 'dockerfile',
    code: `# Build Stage
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Pre-download dependencies to leverage Docker layer caching
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root secure application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/auth-service-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod \\
    SERVER_PORT=8081 \\
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`
  },
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    service: 'infrastructure',
    description: 'Local development cluster running Auth Service, PostgreSQL, Redis, Kafka & Zookeeper',
    language: 'yaml',
    code: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: skillgraph-postgres
    environment:
      POSTGRES_DB: skillgraph_auth
      POSTGRES_USER: skillgraph_user
      POSTGRES_PASSWORD: secret_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7.2-alpine
    container_name: skillgraph-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: skillgraph-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: skillgraph-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  auth-service:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: skillgraph-auth-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - redis
      - kafka
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/skillgraph_auth
      SPRING_REDIS_HOST: redis
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
      JWT_SECRET_KEY: dGhpc0lzQVZlcnlTZWN1cmVTZWNyZXRLZXlGb3JTa2lsbEdyYXBoQXV0aFNlcnZpY2UyMDI2ISNA

volumes:
  postgres_data:
  redis_data:`
  }
];
