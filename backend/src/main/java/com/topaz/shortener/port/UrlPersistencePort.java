package com.topaz.shortener.port;

import com.topaz.shortener.domain.UrlMapping;

import java.util.List;
import java.util.Optional;

public interface UrlPersistencePort {

    UrlMapping save(UrlMapping entity);

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    boolean existsByShortCodeAndIdNot(String shortCode, Long id);

    Optional<UrlMapping> findById(Long id);

    List<UrlMapping> findAllOrderByCreatedAtDesc();

    void deleteById(Long id);

    int incrementAccessCount(String shortCode);
}
