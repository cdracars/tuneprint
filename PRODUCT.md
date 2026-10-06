# TunePrint

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TypeScript + React + Vite; static hosting (GitHub Pages compatible).

## Users

People manually calibrating filament profiles in OrcaSlicer, typically immediately after reviewing a printed calibration test.

## Product Purpose

Turn the measurements or selected bands from OrcaSlicer calibration tests into the setting the user should save, without ads, accounts, installation, or server-side data collection.

## Positioning

A focused, browser-only calculation companion that preserves the user's workflow rather than replacing OrcaSlicer's built-in test generation.

## Operating Context

Users run calibration prints in OrcaSlicer and need a trustworthy calculation for flow ratio, pressure advance, or maximum volumetric speed. E-steps and Klipper rotation distance are handled by the external LayerCalc tool.

## Capabilities and Constraints

Version one provides manual calculators for OrcaSlicer flow ratio, pressure-advance tower, and max volumetric speed. All calculation inputs remain in the browser. The product is unaffiliated with OrcaSlicer and must not imply official endorsement.

## Brand Commitments

TunePrint is calm, precise, ad-free, practical, and explicit about what is a formula versus a visual judgment.

## Evidence on Hand

The official OrcaSlicer Calibration wiki defines the relevant formulas and test workflow. LayerCalc is a user-approved external starting point for E-steps and Klipper rotation distance.

## Product Principles

- Show the formula and the value to save together.
- Keep visual judgment with the person examining the print.
- Make every interaction work without an account or network service.
- Prefer conservative guidance where a physical failure point is gradual.
