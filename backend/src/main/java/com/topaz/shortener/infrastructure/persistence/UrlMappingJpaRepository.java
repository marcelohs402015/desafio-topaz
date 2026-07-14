package com.topaz.shortener.infrastructure.persistence;

import com.topaz.shortener.domain.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrlMappingJpaRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    boolean existsByShortCodeAndIdNot(String shortCode, Long id);

    List<UrlMapping> findAllByOrderByCreatedAtDesc();
}
