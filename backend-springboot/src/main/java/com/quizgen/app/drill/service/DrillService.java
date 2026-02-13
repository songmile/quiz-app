package com.quizgen.app.drill.service;

import java.util.Map;

public interface DrillService {

    Map<String, Object> analyzeWeakness();

    Map<String, Object> startDrill(int count);
}

