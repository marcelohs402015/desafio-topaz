package com.topaz.shortener.infrastructure.persistence;

import com.topaz.shortener.domain.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UrlMappingJpaRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    boolean existsByShortCodeAndIdNot(String shortCode, Long id);

    List<UrlMapping> findAllByOrderByCreatedAtDesc();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE UrlMapping u SET u.accessCount = u.accessCount + 1 WHERE u.shortCode = :shortCode")
    int incrementAccessCount(@Param("shortCode") String shortCode);
}
