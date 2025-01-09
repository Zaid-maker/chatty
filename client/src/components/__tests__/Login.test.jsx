import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Login } from "../Login";

describe("Login Component", () => {
  it("renders login form", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });
});
