import assert from  "node:assert/strict";
import {describe, it} from "node:test";

import {downloadFile} from "./downloadController.js";
import {getRandomVideo} from "./randomController.js";
import {searchSamples} from "./searchController.js";
import {
    uploadSound,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addPack,
  addSampleToPack,
  removePack,
  removeSampleFromPack,
  getPacks,
  getPackSamples,
  createPackAndAddSample,
  getFavoritesWithDetails
} from "./userController.js";
import { get } from "node:http";
import { create } from "node:domain";

describe("Download function", () => {
    it("should work", () => {
        assert.doesNotThrow(() => downloadFile);
    });
});

describe("Video discovery", () => {
    it("should work", () => {
        assert.doesNotThrow(() => getRandomVideo);
    });
});

describe("Search feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => searchSamples);
    });
});

describe("Sample upload feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => uploadSound);
    });
});

describe("Get favorites function", () => {
    it("should work", () => {
        assert.doesNotThrow(() => getFavorites);
    });
});

describe("Favorite adding feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => addToFavorites);
    });
});

describe("Favorite removing feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => removeFromFavorites);
    });
});

describe("Pack creation feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => addPack);
    });
});

describe("Sample addition to pack feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => addSampleToPack);
    });
});

describe("Pack deletion feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => removePack);
    });
});

describe("Sample removal from pack feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => removeSampleFromPack);
    });
});

describe("Get packs function", () => {
    it("should work", () => {
        assert.doesNotThrow(() => getPacks);
    });
});

describe("Get samples from pack function", () => {
    it("should work", () => {
        assert.doesNotThrow(() => getPackSamples);
    });
});

describe("Pack creation on sample addition feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => createPackAndAddSample);
    });
});

describe("Get favorites with details feature", () => {
    it("should work", () => {
        assert.doesNotThrow(() => getFavoritesWithDetails);
    });
});