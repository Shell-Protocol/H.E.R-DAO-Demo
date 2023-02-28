import * as constants from "./constants";
import * as types from "./types";
import * as interactions from "./interactions";
import * as utils from "./utils";

const executeInteractions = async (
    ocean: types.Ocean,
    signer: types.Signer,
    interactions: types.Interaction[],
) => {
    const ids = utils.idsFromInteractions(interactions);
    const [filteredInteractions, etherAmount] = utils.wrapEtherFilter(interactions)

    const gasEstimate = await ocean.estimateGas.doMultipleInteractions(filteredInteractions, ids, {value: etherAmount ?? 0});

    return await ocean.connect(signer).doMultipleInteractions(filteredInteractions, ids, {value: etherAmount ?? 0, gasLimit: gasEstimate.mul(125).div(100)});
    // return await ocean.connect(signer).doMultipleInteractions(filteredInteractions, ids, {value: etherAmount ?? 0});
}

const executeInteraction = async (
    ocean: types.Ocean,
    signer: types.Signer,
    interaction: types.Interaction
) => {
    return await ocean.connect(signer).doInteraction(interaction);
}

export {
    types,
    constants,
    interactions,
    utils,
    executeInteraction,
    executeInteractions
}